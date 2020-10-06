using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Edna.Bindings.Platform;
using Edna.Bindings.Platform.Attributes;
using Edna.Bindings.Platform.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using Microsoft.WindowsAzure.Storage.Table;
using Newtonsoft.Json;
using Edna.Utils.Http;
using System.Collections.Generic;
using System.Linq;
using System;
using Edna.Bindings.User.Attributes;
using Edna.Bindings.User;
using Edna.Bindings.User.Models;

namespace Edna.Assignments
{
    public class AssignmentsApi
    {
        private const string AssignmentsTableName = "Assignments";
        private const string AssignmentsRoutePath = "assignments";
        private const string LtiAdvantageVersionString = "1.3.0";

        private readonly ILogger<AssignmentsApi> _logger;
        private readonly IMapper _mapper;

        public AssignmentsApi(IMapper mapper, ILogger<AssignmentsApi> logger)
        {
            _logger = logger;
            _mapper = mapper;
        }

        [FunctionName(nameof(CreateOrUpdateAssignment))]
        public async Task<IActionResult> CreateOrUpdateAssignment(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = AssignmentsRoutePath)] HttpRequest req,
            [Table(AssignmentsTableName)] CloudTable assignmentsTable,
            [User] UsersClient usersClient)
        {
            string result = await req.ReadAsStringAsync();

            AssignmentDto assignmentDto = JsonConvert.DeserializeObject<AssignmentDto>(result);
            AssignmentEntity assignmentEntity = _mapper.Map<AssignmentEntity>(assignmentDto);
            assignmentEntity.ETag = "*";

            if (!req.Headers.TryGetUserEmails(out List<string> userEmails))
            {
                _logger.LogError("Could not get user email.");
                return new BadRequestErrorMessageResult("Could not get user email.");
            }

            _logger.LogInformation($"Getting user information for '{string.Join(';', userEmails)}'.");

            if (userEmails.Count > 0)
            {
                User[] allMembers = await usersClient.GetAllUsers(assignmentDto.Id);
                User memberDto = allMembers.FirstOrDefault(member => userEmails.Any(userEmail => (member.Email ?? String.Empty).Equals(userEmail)));
                if (!memberDto.Role.Equals("teacher"))
                    return new UnauthorizedResult();
            }

            TableOperation insertOrMergeAssignment = TableOperation.InsertOrMerge(assignmentEntity);
            TableResult insertOrMergeResult = await assignmentsTable.ExecuteAsync(insertOrMergeAssignment);
            if (insertOrMergeResult.HttpStatusCode < 200 || insertOrMergeResult.HttpStatusCode >= 300)
            {
                _logger.LogError($"Could not save assignment {assignmentEntity.ToAssignmentId()}. Error code: {insertOrMergeResult.HttpStatusCode}.");
                return new InternalServerErrorResult();
            }

            _logger.LogInformation($"Saved assignment {assignmentEntity.ToAssignmentId()}.");

            string assignmentUrl = $"{req.Scheme}://{req.Host}/api/{AssignmentsRoutePath}/{assignmentEntity.ToAssignmentId()}";
            AssignmentDto savedAssignmentDto = _mapper.Map<AssignmentDto>(assignmentEntity);

            return new CreatedResult(assignmentUrl, savedAssignmentDto);
        }

        [FunctionName(nameof(GetAssignment))]
        public async Task<IActionResult> GetAssignment(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = AssignmentsRoutePath + "/{assignmentId}")] HttpRequest req,
            [Table(AssignmentsTableName)] CloudTable table,
            [Platform] PlatformsClient platformsClient,
            string assignmentId)
        {
            AssignmentEntity assignmentEntity = await FetchAssignment(table, assignmentId);
            if (assignmentEntity == null)
                return new NotFoundResult();

            AssignmentDto assignmentDto = _mapper.Map<AssignmentDto>(assignmentEntity);

            if (assignmentEntity.LtiVersion == LtiAdvantageVersionString)
            {
                Platform platform = await platformsClient.GetPlatform(assignmentEntity.PlatformId);
                assignmentDto.PlatformPersonalization = _mapper.Map<PlatformPersonalizationDto>(platform);
            }

            return new OkObjectResult(assignmentDto);
        }

        [FunctionName(nameof(PublishAssignment))]
        public async Task<IActionResult> PublishAssignment(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = AssignmentsRoutePath + "/{assignmentId}/publish")] HttpRequest req,
            [Table(AssignmentsTableName)] CloudTable table,
            [Table(AssignmentsTableName)] IAsyncCollector<AssignmentEntity> assignmentEntityCollector,
            string assignmentId,
            [User] UsersClient usersClient)
        {
            return await ChangePublishStatus(req, table, assignmentEntityCollector, assignmentId, usersClient, PublishStatus.Published);
        }

        [FunctionName(nameof(UnpublishAssignment))]
        public async Task<IActionResult> UnpublishAssignment(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = AssignmentsRoutePath + "/{assignmentId}/unpublish")] HttpRequest req,
            [Table(AssignmentsTableName)] CloudTable table,
            [Table(AssignmentsTableName)] IAsyncCollector<AssignmentEntity> assignmentEntityCollector,
            string assignmentId,
            [User] UsersClient usersClient)
        {
            return await ChangePublishStatus(req, table, assignmentEntityCollector, assignmentId, usersClient, PublishStatus.NotPublished);
        }

        private async Task<AssignmentEntity> FetchAssignment(CloudTable table, string assignmentId)
        {
            var (partitionKey, rowKey) = assignmentId.ToEntityIdentifiers(_logger);

            TableOperation retrieveOperation = TableOperation.Retrieve<AssignmentEntity>(partitionKey, rowKey);

            TableResult retrieveResult = await table.ExecuteAsync(retrieveOperation);

            if (retrieveResult.Result == null || !(retrieveResult.Result is AssignmentEntity assignmentEntity))
                return null;

            return assignmentEntity;
        }

        private async Task<IActionResult> ChangePublishStatus(HttpRequest req, CloudTable table, IAsyncCollector<AssignmentEntity> assignmentEntityCollector, string assignmentId, UsersClient usersClient, PublishStatus newPublishStatus)
        {
            AssignmentEntity assignmentEntity = await FetchAssignment(table, assignmentId);
            if (assignmentEntity == null)
                return new NotFoundResult();

            AssignmentDto assignmentDto = _mapper.Map<AssignmentDto>(assignmentEntity);

            if (!req.Headers.TryGetUserEmails(out List<string> userEmails))
            {
                _logger.LogError("Could not get user email.");
                return new BadRequestErrorMessageResult("Could not get user email.");
            }

            _logger.LogInformation($"Getting user information for '{string.Join(';', userEmails)}'.");

            if (userEmails.Count > 0)
            {
                User[] allMembers = await usersClient.GetAllUsers(assignmentId);
                User memberDto = allMembers.FirstOrDefault(member => userEmails.Any(userEmail => (member.Email ?? String.Empty).Equals(userEmail)));
                if (!memberDto.Role.Equals("teacher"))
                    return new UnauthorizedResult();
            }

            assignmentEntity.PublishStatus = newPublishStatus.ToString();
            assignmentEntity.ETag = "*";

            await assignmentEntityCollector.AddAsync(assignmentEntity);
            await assignmentEntityCollector.FlushAsync();

            return new OkResult();
        }
    }
}