// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Azure.Cosmos.Table;
using Newtonsoft.Json;
using Edna.Utils.Http;
using Edna.Bindings.User.Attributes;
using Edna.Bindings.User;
using Edna.Bindings.User.Models;
using System.ComponentModel.DataAnnotations;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;

namespace Edna.AssignmentLinks
{
    public class AssignmentLinksApi
    {
        private readonly ILogger<AssignmentLinksApi> _logger;
        private readonly IMapper _mapper;
        private readonly ConfigurationManager<OpenIdConnectConfiguration> _adManager, _b2CManager;
        private const string AssignmentLinksTableName = "Links";
        
        private static readonly string ValidAudience = Environment.GetEnvironmentVariable("ValidAudience");
        private static readonly string OpenIdConfigurationUrl = Environment.GetEnvironmentVariable("OpenIdConfigurationUrl");

        public AssignmentLinksApi(ILogger<AssignmentLinksApi> logger, IMapper mapper,
            IEnumerable<ConfigurationManager<OpenIdConnectConfiguration>> managers)
        {
            _logger = logger;
            _mapper = mapper;
            
            var configurationManagers = managers.ToList();
            _adManager = configurationManagers.FirstOrDefault(m =>
                m.MetadataAddress == Environment.GetEnvironmentVariable("ADConfigurationUrl"));
            _b2CManager = configurationManagers.FirstOrDefault(m =>
                m.MetadataAddress == Environment.GetEnvironmentVariable("B2CConfigurationUrl"));
        }

        [FunctionName(nameof(GetAllLinks))]
        public async Task<IActionResult> GetAllLinks(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "assignments/{assignmentId}/links")] HttpRequest req,
            [Table(AssignmentLinksTableName)] CloudTable assignmentLinkTable,
            string assignmentId)
        {
            _logger.LogInformation("Getting all links for assignment " + assignmentId);

            TableQuery<AssignmentLinkEntity> sameAssignmentLinksQuery = new TableQuery<AssignmentLinkEntity>()
                .Where(
                    TableQuery.GenerateFilterCondition(nameof(TableEntity.PartitionKey), QueryComparisons.Equal, assignmentId)
                );

            List<AssignmentLinkEntity> sameAssignmentLinks = new List<AssignmentLinkEntity>();
            TableContinuationToken continuationToken = new TableContinuationToken();
            do
            {
                TableQuerySegment<AssignmentLinkEntity> queryResultSegment = await assignmentLinkTable.ExecuteQuerySegmentedAsync(sameAssignmentLinksQuery, continuationToken);
                continuationToken = queryResultSegment.ContinuationToken;

                sameAssignmentLinks.AddRange(queryResultSegment.Results);

            } while (continuationToken != null);

            IEnumerable<AssignmentLinkDto> assignmentLinkDtos = sameAssignmentLinks
                .OrderBy(linkEntity => linkEntity.Timestamp.Ticks)
                .Select(_mapper.Map<AssignmentLinkDto>);

            return new OkObjectResult(assignmentLinkDtos);
        }

        [FunctionName(nameof(GetSingleLink))]
        public IActionResult GetSingleLink(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "assignments/{assignmentId}/links/{linkId}")] HttpRequest req,
            [Table(AssignmentLinksTableName, "{assignmentId}", "{linkId}")] AssignmentLinkEntity linkEntity)
        {
            if (linkEntity == null)
                return new NotFoundResult();
            else if (!Guid.TryParse(linkEntity.RowKey, out Guid result))
                return new BadRequestErrorMessageResult("The provided link Id is malformed.");

            return new OkObjectResult(_mapper.Map<AssignmentLinkDto>(linkEntity));
        }

        [FunctionName(nameof(SaveLink))]
        public async Task<IActionResult> SaveLink(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "assignments/{assignmentId}/links/{linkId}")] HttpRequest req,
            [Table(AssignmentLinksTableName)] IAsyncCollector<AssignmentLinkEntity> linksCollector,
            string assignmentId,
            string linkId,
            [User] UsersClient usersClient)
        {
            if (!await req.Headers.ValidateToken(_adManager, _b2CManager, ValidAudience, message => _logger.LogError(message)))
                return new UnauthorizedResult();
            bool isSystemCallOrUserWithValidEmail = req.Headers.TryGetUserEmails(out List<string> userEmails);
            if (!isSystemCallOrUserWithValidEmail)
            {
                _logger.LogError("Could not get user email.");
                return new BadRequestErrorMessageResult("Could not get user email.");
            }

            if (userEmails.Count > 0)
            {
                _logger.LogInformation($"Getting user information for '{string.Join(';', userEmails)}'.");

                User[] allUsers = await usersClient.GetAllUsers(assignmentId);
                User user = allUsers.FirstOrDefault(member => userEmails.Any(userEmail => (member.Email ?? String.Empty).Equals(userEmail)));
                if (user == null || !user.Role.Equals("teacher"))
                    return new UnauthorizedResult();
            }

            string linkJson = await req.ReadAsStringAsync();
            AssignmentLinkDto linkDto;
            try
            {
                linkDto = JsonConvert.DeserializeObject<AssignmentLinkDto>(linkJson);
            } catch (Exception ex)
            {
                return new BadRequestErrorMessageResult("Could not create a valid link from the request. " + ex.Message);
            }

            if (linkId != linkDto.Id.ToString())
                return new BadRequestErrorMessageResult("The provided link content doesn't match the path.");

            _logger.LogInformation($"Starting the save process of link with ID [{linkId}] to assignment [{assignmentId}].");

            AssignmentLinkEntity assignmentLinkEntity = _mapper.Map<AssignmentLinkEntity>(linkDto);
            assignmentLinkEntity.PartitionKey = assignmentId;
            assignmentLinkEntity.ETag = "*";

            System.ComponentModel.DataAnnotations.ValidationContext context = new System.ComponentModel.DataAnnotations.ValidationContext(assignmentLinkEntity, null, null);
            bool isValid = Validator.TryValidateObject(assignmentLinkEntity, context, new List<ValidationResult>(), true);
            if (!isValid)
            {
                return new BadRequestErrorMessageResult("The provided link field values are not valid.");
            }

            await linksCollector.AddAsync(assignmentLinkEntity);
            await linksCollector.FlushAsync();

            AssignmentLinkDto savedLinkDto = _mapper.Map<AssignmentLinkDto>(assignmentLinkEntity);
            string assignmentUrl = $"{req.Scheme}://{req.Host}/api/assignments/{assignmentId}/links/{savedLinkDto.Id}";

            return new CreatedResult(assignmentUrl, savedLinkDto);
        }

        [FunctionName(nameof(DeleteLink))]
        public async Task<IActionResult> DeleteLink(
            [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "assignments/{assignmentId}/links/{linkId}")] HttpRequest req,
            [Table(AssignmentLinksTableName)] CloudTable assignmentLinksTable,
            [Table(AssignmentLinksTableName, "{assignmentId}", "{linkId}")] AssignmentLinkEntity entityToDelete,
            string assignmentId,
            [User] UsersClient usersClient)
        {
            if (!await req.Headers.ValidateToken(_adManager, _b2CManager, ValidAudience, message => _logger.LogError(message)))
                return new UnauthorizedResult();
            bool isSystemCallOrUserWithValidEmail = req.Headers.TryGetUserEmails(out List<string> userEmails);
            if (!isSystemCallOrUserWithValidEmail)
            {
                _logger.LogError("Could not get user email.");
                return new BadRequestErrorMessageResult("Could not get user email.");
            }

            if (userEmails.Count > 0)
            {
                _logger.LogInformation($"Getting user information for '{string.Join(';', userEmails)}'.");

                User[] allUsers = await usersClient.GetAllUsers(assignmentId);
                User user = allUsers.FirstOrDefault(member => userEmails.Any(userEmail => (member.Email ?? String.Empty).Equals(userEmail)));
                if (user == null || !user.Role.Equals("teacher"))
                    return new UnauthorizedResult();
            }

            if (entityToDelete == null)
                return new NoContentResult();

            TableOperation deleteTable = TableOperation.Delete(entityToDelete);
            TableResult deleteResult = await assignmentLinksTable.ExecuteAsync(deleteTable);

            if (deleteResult.HttpStatusCode < 200 || deleteResult.HttpStatusCode >= 300)
                return new InternalServerErrorResult();

            return new OkResult();
        }
    }
}