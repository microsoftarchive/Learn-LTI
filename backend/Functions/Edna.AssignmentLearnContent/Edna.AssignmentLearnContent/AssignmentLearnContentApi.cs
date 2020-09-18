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

namespace Edna.AssignmentLearnContent
{
    public class AssignmentLearnContentApi
    {
        private const string AssignmentLearnContentTableName = "AssignmentLearnContent";
        private const string LearnContentUrlIdentifierKey = "WT.mc_id";
        private const string LearnContentUrlIdentifierValue = "Edna";
        private const string LtiAdvantageVersionString = "1.3.0";

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
            [Table(AssignmentLearnContentTableName)] IAsyncCollector<AssignmentLearnContentEntity> linksCollector,
            string assignmentId,
            string contentUid,
            [Assignment(AssignmentId = "{assignmentId}")] Assignment assignment,
            [Platform] PlatformsClient platformsClient,
            [LtiAdvantage] INrpsClient nrpsClient,
            [Lti1] Lti1MembershipClient membershipClient)
        {
            IActionResult res = await ValidateUser(req, assignment, platformsClient, nrpsClient, membershipClient);
            if (res.GetType() != typeof(OkResult))
                return res;

            _logger.LogInformation($"Saving assignment learn content with uid [{contentUid}] to assignment {assignmentId}");

            AssignmentLearnContentEntity assignmentLearnContentEntity = new AssignmentLearnContentEntity();
            assignmentLearnContentEntity.PartitionKey = assignmentId;
            assignmentLearnContentEntity.RowKey = contentUid;
            assignmentLearnContentEntity.ETag = "*";

            await linksCollector.AddAsync(assignmentLearnContentEntity);
            await linksCollector.FlushAsync();

            _logger.LogInformation("Learn Content saved.");

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
            [Assignment(AssignmentId = "{assignmentId}")] Assignment assignment,
            [Platform] PlatformsClient platformsClient,
            [LtiAdvantage] INrpsClient nrpsClient,
            [Lti1] Lti1MembershipClient membershipClient)
        {
            if (assignmentLearnContentEntityToDelete == null)
            {
                _logger.LogInformation("entity is null");
                return new OkResult();
            }

            IActionResult res = await ValidateUser(req, assignment, platformsClient, nrpsClient, membershipClient);
            if (res.GetType() != typeof(OkResult))
                return res;

            _logger.LogInformation($"Removing assignment learn content with uid [{contentUid}] from assignment {assignmentId}");

            TableOperation deleteOperation = TableOperation.Delete(assignmentLearnContentEntityToDelete);
            TableResult deleteResult = await assignmentLearnContentTable.ExecuteAsync(deleteOperation);

            if (deleteResult.HttpStatusCode < 200 || deleteResult.HttpStatusCode >= 300)
                return new InternalServerErrorResult();

            _logger.LogInformation("Learn Content removed.");

            return new OkResult();
        }

        [FunctionName(nameof(ClearAssignmentLearnContent))]
        public async Task<IActionResult> ClearAssignmentLearnContent(
            [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "assignments/{assignmentId}/learn-content")] HttpRequest req,
            [Table(AssignmentLearnContentTableName)] CloudTable assignmentLearnContentTable,
            string assignmentId,
            [Assignment(AssignmentId = "{assignmentId}")] Assignment assignment,
            [Platform] PlatformsClient platformsClient,
            [LtiAdvantage] INrpsClient nrpsClient,
            [Lti1] Lti1MembershipClient membershipClient)
        {
            IActionResult res = await ValidateUser(req, assignment, platformsClient, nrpsClient, membershipClient);
            if (res.GetType() != typeof(OkResult))
                return res;

            _logger.LogInformation($"Removing all assignment learn content from assignment {assignmentId}");

            List<AssignmentLearnContentEntity> assignmentLearnContentEntities = await GetAllAssignmentLearnContentEntities(assignmentLearnContentTable, assignmentId);
            TableBatchOperation deleteBatchOperations = new TableBatchOperation();
            assignmentLearnContentEntities
                .Select(TableOperation.Delete)
                .ForEach(deleteBatchOperations.Add);

            IList<TableResult> executeBatchResults = await assignmentLearnContentTable.ExecuteBatchAsync(deleteBatchOperations);
            bool errorExists = executeBatchResults.Any(result => result.HttpStatusCode < 200 || result.HttpStatusCode >= 300);

            if (errorExists)
                return new InternalServerErrorResult();

            _logger.LogInformation("Learn Content removed.");

            return new OkResult();
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