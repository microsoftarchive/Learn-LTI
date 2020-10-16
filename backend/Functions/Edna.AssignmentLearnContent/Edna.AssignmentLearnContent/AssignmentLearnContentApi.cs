// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Edna.Utils.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.WindowsAzure.Storage.Table;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Edna.Utils.Http;
using Edna.Bindings.User.Attributes;
using Edna.Bindings.User;
using Edna.Bindings.User.Models;

namespace Edna.AssignmentLearnContent
{
    public class AssignmentLearnContentApi
    {
        private const string AssignmentLearnContentTableName = "AssignmentLearnContent";
        private const string LearnContentUrlIdentifierKey = "WT.mc_id";
        private const string LearnContentUrlIdentifierValue = "Edna";

        private readonly ILogger<AssignmentLearnContentApi> _logger;
        private readonly IMapper _mapper;
        private readonly IHttpClientFactory _httpClientFactory;

        public AssignmentLearnContentApi(ILogger<AssignmentLearnContentApi> logger, IMapper mapper, IHttpClientFactory httpClientFactory)
        {
            _logger = logger;
            _mapper = mapper;
            _httpClientFactory = httpClientFactory;
        }

        [FunctionName(nameof(GetLearnCatalog))]
        public async Task<IActionResult> GetLearnCatalog(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "learn-catalog")] HttpRequest req)
        {
            using HttpClient client = _httpClientFactory.CreateClient();
            string catalogString = await client.GetStringAsync($"https://docs.microsoft.com/api/learn/catalog?clientId={LearnContentUrlIdentifierValue}");

            JObject catalogJObject = JsonConvert.DeserializeObject<JObject>(catalogString);
            catalogJObject["modules"].ForEach(ChangeUrlQueryToEdnaIdentifier);
            catalogJObject["learningPaths"].ForEach(ChangeUrlQueryToEdnaIdentifier);

            return new OkObjectResult(JsonConvert.SerializeObject(catalogJObject));
        }

        [FunctionName(nameof(GetAllAssignmentLearnContent))]
        public async Task<IActionResult> GetAllAssignmentLearnContent(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "assignments/{assignmentId}/learn-content")] HttpRequest req,
            [Table(AssignmentLearnContentTableName)] CloudTable assignmentLearnContentTable,
            string assignmentId)
        {
            _logger.LogInformation($"Fetching all selected learn content for assignment {assignmentId}.");

            List<AssignmentLearnContentEntity> assignmentSelectedLearnContent = await GetAllAssignmentLearnContentEntities(assignmentLearnContentTable, assignmentId);

            IEnumerable<AssignmentLearnContentDto> assignmentSelectedLearnContentDtos = assignmentSelectedLearnContent
                .OrderBy(entity => entity.Timestamp.Ticks)
                .Select(_mapper.Map<AssignmentLearnContentDto>);

            return new OkObjectResult(assignmentSelectedLearnContentDtos);
        }

        [FunctionName(nameof(SaveAssignmentLearnContent))]
        public async Task<IActionResult> SaveAssignmentLearnContent(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "assignments/{assignmentId}/learn-content/{contentUid}")] HttpRequest req,
            [Table(AssignmentLearnContentTableName)] IAsyncCollector<AssignmentLearnContentEntity> learnContentCollector,
            string assignmentId,
            string contentUid,
            [User] UsersClient usersClient)
        {
            bool isSystemCallOrUserWithValidEmail = req.Headers.TryGetUserEmails(out List<string> userEmails);
            if (!isSystemCallOrUserWithValidEmail)
            {
                _logger.LogError("Could not get user email.");
                return new BadRequestErrorMessageResult("Could not get user email.");
            }

            _logger.LogInformation($"Getting user information for '{string.Join(';', userEmails)}'.");

            if (userEmails.Count > 0)
            {
                User[] allUsers = await usersClient.GetAllUsers(assignmentId);
                User user = allUsers.FirstOrDefault(member => userEmails.Any(userEmail => (member.Email ?? String.Empty).Equals(userEmail)));
                if (user == null || !user.Role.Equals("teacher"))
                    return new UnauthorizedResult();
            }

            _logger.LogInformation($"Saving assignment learn content with uid [{contentUid}] to assignment {assignmentId}");

            AssignmentLearnContentEntity assignmentLearnContentEntity = new AssignmentLearnContentEntity { PartitionKey = assignmentId, RowKey = contentUid, ETag = "*" };

            await learnContentCollector.AddAsync(assignmentLearnContentEntity);
            await learnContentCollector.FlushAsync();

            AssignmentLearnContentDto savedLearnContentDto = _mapper.Map<AssignmentLearnContentDto>(assignmentLearnContentEntity);
            string assignmentUrl = $"{req.Scheme}://{req.Host}/api/assignments/{assignmentId}/learn-content/{savedLearnContentDto.ContentUid}";

            return new CreatedResult(assignmentUrl, savedLearnContentDto);
        }

        [FunctionName(nameof(RemoveAssignmentLearnContent))]
        public async Task<IActionResult> RemoveAssignmentLearnContent(
            [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "assignments/{assignmentId}/learn-content/{contentUid}")] HttpRequest req,
            [Table(AssignmentLearnContentTableName)] CloudTable assignmentLearnContentTable,
            [Table(AssignmentLearnContentTableName, "{assignmentId}", "{contentUid}")] AssignmentLearnContentEntity assignmentLearnContentEntityToDelete,
            string assignmentId,
            string contentUid,
            [User] UsersClient usersClient)
        {
            bool isSystemCallOrUserWithValidEmail = req.Headers.TryGetUserEmails(out List<string> userEmails);
            if (!isSystemCallOrUserWithValidEmail)
            {
                _logger.LogError("Could not get user email.");
                return new BadRequestErrorMessageResult("Could not get user email.");
            }

            _logger.LogInformation($"Getting user information for '{string.Join(';', userEmails)}'.");

            if (userEmails.Count > 0)
            {
                User[] allUsers = await usersClient.GetAllUsers(assignmentId);
                User user = allUsers.FirstOrDefault(member => userEmails.Any(userEmail => (member.Email ?? String.Empty).Equals(userEmail)));
                if (user == null || !user.Role.Equals("teacher"))
                    return new UnauthorizedResult();
            }

            if (assignmentLearnContentEntityToDelete == null)
                return new NoContentResult();

            _logger.LogInformation($"Removing assignment learn content with uid [{contentUid}] from assignment {assignmentId}");

            TableOperation deleteOperation = TableOperation.Delete(assignmentLearnContentEntityToDelete);
            TableResult deleteResult = await assignmentLearnContentTable.ExecuteAsync(deleteOperation);

            if (deleteResult.HttpStatusCode < 200 || deleteResult.HttpStatusCode >= 300)
                return new InternalServerErrorResult();

            return new OkResult();
        }

        [FunctionName(nameof(ClearAssignmentLearnContent))]
        public async Task<IActionResult> ClearAssignmentLearnContent(
            [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "assignments/{assignmentId}/learn-content")] HttpRequest req,
            [Table(AssignmentLearnContentTableName)] CloudTable assignmentLearnContentTable,
            string assignmentId,
            [User] UsersClient usersClient)
        {
            bool isSystemCallOrUserWithValidEmail = req.Headers.TryGetUserEmails(out List<string> userEmails);
            if (!isSystemCallOrUserWithValidEmail)
            {
                _logger.LogError("Could not get user email.");
                return new BadRequestErrorMessageResult("Could not get user email.");
            }

            _logger.LogInformation($"Getting user information for '{string.Join(';', userEmails)}'.");

            if (userEmails.Count > 0)
            {
                User[] allUsers = await usersClient.GetAllUsers(assignmentId);
                User user = allUsers.FirstOrDefault(member => userEmails.Any(userEmail => (member.Email ?? String.Empty).Equals(userEmail)));
                if (user == null || !user.Role.Equals("teacher"))
                    return new UnauthorizedResult();
            }

            List<AssignmentLearnContentEntity> assignmentLearnContentEntities = await GetAllAssignmentLearnContentEntities(assignmentLearnContentTable, assignmentId);

            if (assignmentLearnContentEntities.Count == 0)
                return new NoContentResult();

            _logger.LogInformation($"Removing all assignment learn content from assignment {assignmentId}");

            TableBatchOperation deleteBatchOperations = new TableBatchOperation();
            assignmentLearnContentEntities
                .Select(TableOperation.Delete)
                .ForEach(deleteBatchOperations.Add);

            IList<TableResult> executeBatchResults = await assignmentLearnContentTable.ExecuteBatchAsync(deleteBatchOperations);
            bool errorExists = executeBatchResults.Any(result => result.HttpStatusCode < 200 || result.HttpStatusCode >= 300);

            return errorExists
                ? (IActionResult)new InternalServerErrorResult()
                : new OkResult();
        }

        private async Task<List<AssignmentLearnContentEntity>> GetAllAssignmentLearnContentEntities(CloudTable assignmentLearnContentTable, string assignmentId)
        {
            TableQuery<AssignmentLearnContentEntity> assignmentSelectedLearnContentQuery = new TableQuery<AssignmentLearnContentEntity>()
                .Where(
                    TableQuery.GenerateFilterCondition(nameof(TableEntity.PartitionKey), QueryComparisons.Equal, assignmentId)
                );

            List<AssignmentLearnContentEntity> assignmentSelectedLearnContent = new List<AssignmentLearnContentEntity>();
            TableContinuationToken continuationToken = new TableContinuationToken();
            do
            {
                TableQuerySegment<AssignmentLearnContentEntity> querySegment = await assignmentLearnContentTable.ExecuteQuerySegmentedAsync(assignmentSelectedLearnContentQuery, continuationToken);
                continuationToken = querySegment.ContinuationToken;
                assignmentSelectedLearnContent.AddRange(querySegment.Results);
            } while (continuationToken != null);

            return assignmentSelectedLearnContent;
        }

        private void ChangeUrlQueryToEdnaIdentifier(JToken contentJToken)
        {
            string url = contentJToken["url"]?.ToString();
            if (string.IsNullOrEmpty(url))
                return;

            Uri previousUri = new Uri(url);
            NameValueCollection queryParams = previousUri.ParseQueryString();
            queryParams[LearnContentUrlIdentifierKey] = LearnContentUrlIdentifierValue;

            UriBuilder newUriBuilder = new UriBuilder(url) { Query = queryParams.ToString() };

            contentJToken["url"] = newUriBuilder.Uri.ToString();
        }
    }
}