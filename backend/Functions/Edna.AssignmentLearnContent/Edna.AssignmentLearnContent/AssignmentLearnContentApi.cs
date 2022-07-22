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
using Microsoft.Azure.Cosmos.Table;
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
            using HttpClient client = _httpClientFactory.CreateClient(EdnaExternalHttpHandler.Name);
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
            _logger.LogError($"Fetching all selected learn content for assignment {assignmentId}."); // TODO return to loginfo

            List<AssignmentLearnContentEntity> assignmentSelectedLearnContent = await GetAllAssignmentLearnContentEntities(assignmentLearnContentTable, assignmentId);

            IEnumerable<AssignmentLearnContentDto> assignmentSelectedLearnContentDtos = assignmentSelectedLearnContent
                .OrderBy(entity => entity.Timestamp.Ticks)
                .Select(_mapper.Map<AssignmentLearnContentDto>);

            // TODO remove
            _logger.LogError("My dtos are " + assignmentSelectedLearnContentDtos.Count().ToString());
            if (assignmentSelectedLearnContentDtos.Count() > 0)
            {
                _logger.LogError(assignmentSelectedLearnContentDtos.FirstOrDefault().ContentUid);
            }
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
            #region "DM: VALIDATION OF USER EMAIL EXISTING, DOUBT THE CHANGE OF AD TO B2C WILL CHANGE THIS API BUT FLAGGED TO CHECK FURTHER"
            // validating user email exists in the request header
            bool isSystemCallOrUserWithValidEmail = req.Headers.TryGetUserEmails(out List<string> userEmails);
            if (!isSystemCallOrUserWithValidEmail)
            {
                _logger.LogError("Could not get user email.");
                return new BadRequestErrorMessageResult("Could not get user email.");
            }
            #endregion

            if (userEmails.Count > 0)
            {
                #region "DM: getting list of for the assignment from AD and checking they are authorized (teacher status)"
                _logger.LogInformation($"Getting user information for '{string.Join(';', userEmails)}'."); // Creating logger for logging user (email owner) information

                User[] allUsers = await usersClient.GetAllUsers(assignmentId); // Getting all users for the assignment
                User user = allUsers.FirstOrDefault(member => userEmails.Any(userEmail => (member.Email ?? String.Empty).Equals(userEmail))); // Getting user from the list of emails
                // If the user is not found or the user is NOT a teacher, return UnauthorizedResult
                if (user == null || !user.Role.Equals("teacher"))
                    return new UnauthorizedResult();
                #endregion
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
            #region "DM: VALIDATION OF USER EMAIL EXISTING, DOUBT THE CHANGE OF AD TO B2C WILL CHANGE THIS API BUT FLAGGED TO CHECK FURTHER"
            // validating user email exists in the request header
            bool isSystemCallOrUserWithValidEmail = req.Headers.TryGetUserEmails(out List<string> userEmails);
            if (!isSystemCallOrUserWithValidEmail)
            {
                _logger.LogError("Could not get user email.");
                return new BadRequestErrorMessageResult("Could not get user email.");
            }
            #endregion

            if (userEmails.Count > 0)
            {
                #region "DM: [SAME AS LINE 98] getting list of for the assignment from AD and checking they are authorized (teacher status)"
                _logger.LogInformation($"Getting user information for '{string.Join(';', userEmails)}'.");

                User[] allUsers = await usersClient.GetAllUsers(assignmentId);
                User user = allUsers.FirstOrDefault(member => userEmails.Any(userEmail => (member.Email ?? String.Empty).Equals(userEmail)));
                if (user == null || !user.Role.Equals("teacher"))
                    return new UnauthorizedResult();
                #endregion
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
            #region "DM: VALIDATION OF USER EMAIL EXISTING, DOUBT THE CHANGE OF AD TO B2C WILL CHANGE THIS API BUT FLAGGED TO CHECK FURTHER"
            // validating user email exists in the request header
            bool isSystemCallOrUserWithValidEmail = req.Headers.TryGetUserEmails(out List<string> userEmails);
            if (!isSystemCallOrUserWithValidEmail)
            {
                _logger.LogError("Could not get user email.");
                return new BadRequestErrorMessageResult("Could not get user email.");
            }
            #endregion

            if (userEmails.Count > 0)
            {
                #region "DM: [SAME AS LINE98] getting list of for the assignment from AD and checking they are authorized (teacher status)"
                _logger.LogInformation($"Getting user information for '{string.Join(';', userEmails)}'.");

                User[] allUsers = await usersClient.GetAllUsers(assignmentId);
                User user = allUsers.FirstOrDefault(member => userEmails.Any(userEmail => (member.Email ?? String.Empty).Equals(userEmail)));
                if (user == null || !user.Role.Equals("teacher"))
                    return new UnauthorizedResult();
                #endregion
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


        #region "DM: (POSSIBLY) IMPORTANT FUNCTION FOR OUR MODIFIED AUTHORIZATION, UTILISES TOKENS"
        // function for getting all the assignmentLearnContent entities in the tenant (?)
        private async Task<List<AssignmentLearnContentEntity>> GetAllAssignmentLearnContentEntities(CloudTable assignmentLearnContentTable, string assignmentId)
        {
            TableQuery<AssignmentLearnContentEntity> assignmentSelectedLearnContentQuery = new TableQuery<AssignmentLearnContentEntity>()
                .Where(
                    TableQuery.GenerateFilterCondition(nameof(TableEntity.PartitionKey), QueryComparisons.Equal, assignmentId)
                ); // get all the entities with the same partition key as the assignmentId (?)

            List<AssignmentLearnContentEntity> assignmentSelectedLearnContent = new List<AssignmentLearnContentEntity>(); // create an empty list of AssignmentLearnContentEntity

            TableContinuationToken continuationToken = new TableContinuationToken(); // create a new empty TableContinuationToken

            // loop through the assignmentLearnContentTable and add the entities to assignmentSelectedLearnContent
            do
            {
                TableQuerySegment<AssignmentLearnContentEntity> querySegment = await assignmentLearnContentTable.ExecuteQuerySegmentedAsync(assignmentSelectedLearnContentQuery, continuationToken); // get the next segment of the assignmentLearnContentTable (?)
                continuationToken = querySegment.ContinuationToken; // set the continuationToken to the next segment of the query
                assignmentSelectedLearnContent.AddRange(querySegment.Results); // add the entities to the list
            } while (continuationToken != null); //until there are no more continuation tokens

            return assignmentSelectedLearnContent;
        }
        #endregion

        #region "DM: (POSSIBLY) IMPORTANT FUNCTION FOR OUR MODIFIED AUTHORIZATION, UTILISES JSON TOKENS"
        // takes in a JSON token for the content
        private void ChangeUrlQueryToEdnaIdentifier(JToken contentJToken)
        {
            string url = contentJToken["url"]?.ToString(); // get the url from the decoded JSON token
            if (string.IsNullOrEmpty(url)) // if the url is null or empty, return
                return;

            Uri previousUri = new Uri(url); //store the old url in a Uri object
            NameValueCollection queryParams = previousUri.ParseQueryString(); //parse the query string of the old url into a NameValueCollection object
            queryParams[LearnContentUrlIdentifierKey] = LearnContentUrlIdentifierValue; //add the "edna" identifier to the query string of the old url (defined at line 55)

            UriBuilder newUriBuilder = new UriBuilder(url) { Query = queryParams.ToString() }; // create a new UriBuilder object with the new url and the query string

            contentJToken["url"] = newUriBuilder.Uri.ToString(); //update the JSON tokens url with the newly generated url
        }
        #endregion
    }
}