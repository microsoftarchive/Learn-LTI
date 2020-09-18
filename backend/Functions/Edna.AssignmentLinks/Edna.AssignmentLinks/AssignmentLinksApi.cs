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
using Microsoft.WindowsAzure.Storage.Table;
using Newtonsoft.Json;
using Edna.Bindings.Lti1;
using Edna.Bindings.LtiAdvantage.Attributes;
using Edna.Bindings.LtiAdvantage.Services;
using Edna.Bindings.Platform;
using Edna.Bindings.Platform.Attributes;
using Edna.Bindings.Platform.Models;
using Edna.Utils.Http;
using LtiLibrary.NetCore.Lis.v2;
using LtiAdvantage.NamesRoleProvisioningService;
using LtiAdvantage.Lti;
using Edna.Bindings.Assignment.Attributes;
using Edna.Bindings.Assignment.Models;
using LtiLibrary.NetCore.Lis.v1;

namespace Edna.AssignmentLinks
{
    public class AssignmentLinksApi
    {
        private readonly ILogger<AssignmentLinksApi> _logger;
        private readonly IMapper _mapper;
        private const string AssignmentLinksTableName = "Links";
        private const string LtiAdvantageVersionString = "1.3.0";

        public AssignmentLinksApi(ILogger<AssignmentLinksApi> logger, IMapper mapper)
        {
            _logger = logger;
            _mapper = mapper;
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

            return new OkObjectResult(_mapper.Map<AssignmentLinkDto>(linkEntity));
        }

        [FunctionName(nameof(SaveLink))]
        public async Task<IActionResult> SaveLink(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "assignments/{assignmentId}/links/{linkId}")] HttpRequest req,
            [Table(AssignmentLinksTableName)] IAsyncCollector<AssignmentLinkEntity> linksCollector,
            string assignmentId,
            string linkId,
            [Assignment(AssignmentId = "{assignmentId}")] Assignment assignment,
            [Platform] PlatformsClient platformsClient,
            [LtiAdvantage] INrpsClient nrpsClient,
            [Lti1] Lti1MembershipClient membershipClient)
        {
            string linkJson = await req.ReadAsStringAsync();
            AssignmentLinkDto linkDto = JsonConvert.DeserializeObject<AssignmentLinkDto>(linkJson);

            if (linkId != linkDto.Id)
                return new BadRequestErrorMessageResult("The provided link content doesn't match the path.");

            IActionResult res = await ValidateUser(req, assignment, platformsClient, nrpsClient, membershipClient);
            if (res.GetType() != typeof(OkResult))
                return res;

            _logger.LogInformation($"Starting the save process of link with ID [{linkId}] to assignment [{assignmentId}].");

            AssignmentLinkEntity assignmentLinkEntity = _mapper.Map<AssignmentLinkEntity>(linkDto);
            assignmentLinkEntity.PartitionKey = assignmentId;
            assignmentLinkEntity.ETag = "*";

            await linksCollector.AddAsync(assignmentLinkEntity);
            await linksCollector.FlushAsync();

            _logger.LogInformation("Link saved.");

            AssignmentLinkDto savedLinkDto = _mapper.Map<AssignmentLinkDto>(assignmentLinkEntity);
            string assignmentUrl = $"{req.Scheme}://{req.Host}/api/assignments/{assignmentId}/links/{savedLinkDto.Id}";

            return new CreatedResult(assignmentUrl, savedLinkDto);
        }

        [FunctionName(nameof(DeleteLink))]
        public async Task<IActionResult> DeleteLink(
            [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "assignments/{assignmentId}/links/{linkId}")] HttpRequest req,
            [Table(AssignmentLinksTableName)] CloudTable assignmentLinksTable,
            [Table(AssignmentLinksTableName, "{assignmentId}", "{linkId}")] AssignmentLinkEntity entityToDelete,
            [Assignment(AssignmentId = "{assignmentId}")] Assignment assignment,
            [Platform] PlatformsClient platformsClient,
            [LtiAdvantage] INrpsClient nrpsClient,
            [Lti1] Lti1MembershipClient membershipClient)
        {
            if (entityToDelete == null)
            {
                _logger.LogInformation("Entity to delete is null");
                return new OkResult();
            }

            IActionResult res = await ValidateUser(req, assignment, platformsClient, nrpsClient, membershipClient);
            if (res.GetType() != typeof(OkResult))
                return res;

            TableOperation deleteTable = TableOperation.Delete(entityToDelete);
            TableResult deleteResult = await assignmentLinksTable.ExecuteAsync(deleteTable);

            if (deleteResult.HttpStatusCode < 200 || deleteResult.HttpStatusCode >= 300)
                return new InternalServerErrorResult();

            _logger.LogInformation("Link deleted.");

            return new OkResult();
        }

        private async Task<IActionResult> ValidateUser(HttpRequest req, Assignment assignment, PlatformsClient platformsClient, INrpsClient nrpsClient, Lti1MembershipClient membershipClient)
        {
            if (!req.Headers.TryGetUserEmails(out List<string> userEmails))
            {
                _logger.LogError("Could not get user email.");
                return new BadRequestErrorMessageResult("Bad Request: Could not get user email.");
            }

            _logger.LogInformation($"Getting user information for '{string.Join(';', userEmails)}'.");

            if (userEmails.Count > 0)
                return await ValidateUserEmails(assignment, platformsClient, nrpsClient, membershipClient, userEmails);

            return new OkResult();
        }

        private async Task<IActionResult> ValidateUserEmails(Assignment assignment, PlatformsClient platformsClient, INrpsClient nrpsClient, Lti1MembershipClient membershipClient, List<string> userEmails)
        {
            if (assignment.LtiVersion != LtiAdvantageVersionString)
            {
                Membership userMembership = await membershipClient.GetMemberByEmail(assignment.ContextMembershipsUrl, assignment.OAuthConsumerKey, assignment.ResourceLinkId, userEmails);
                if (userMembership == null)
                {
                    _logger.LogError("no members with the given user emails");
                    return new BadRequestErrorMessageResult("Invalid User");
                }
                if (userMembership.Role.Equals(ContextRole.Learner))
                {
                    _logger.LogError("Students cannot update an assignment");
                    return new UnauthorizedResult();
                }
            }
            else
            {
                Platform platform = await platformsClient.GetPlatform(assignment.PlatformId);
                Member member = await nrpsClient.GetByEmail(platform.ClientId, platform.AccessTokenUrl, assignment.ContextMembershipsUrl, userEmails);
                if (member == null)
                {
                    _logger.LogError("no members with the given user emails");
                    return new BadRequestErrorMessageResult("Invalid User");
                }
                if (member.Roles.Contains(Role.ContextLearner) || member.Roles.Contains(Role.InstitutionLearner))
                {
                    _logger.LogError("Students cannot update an assignment");
                    return new UnauthorizedResult();
                }
            }
            return new OkResult();
        }
    }
}