using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Edna.Bindings.Lti1;
using Edna.Bindings.LtiAdvantage.Attributes;
using Edna.Bindings.LtiAdvantage.Services;
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
using LtiLibrary.NetCore.Lis.v2;
using LtiAdvantage.NamesRoleProvisioningService;
using LtiAdvantage.Lti;
using System.Linq;
using System;

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
            [Platform] PlatformsClient platformsClient,
            [LtiAdvantage] INrpsClient nrpsClient,
            [Lti1] Lti1MembershipClient membershipClient)
        {
            string result = await req.ReadAsStringAsync();

            AssignmentDto assignmentDto = JsonConvert.DeserializeObject<AssignmentDto>(result);
            AssignmentEntity assignmentEntity = _mapper.Map<AssignmentEntity>(assignmentDto);
            assignmentEntity.ETag = "*";

            var res = await ValidateUser(req, assignmentDto, platformsClient, nrpsClient, membershipClient);
            if(res.GetType() != typeof(OkResult))
                return res;
            
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
            [Platform] PlatformsClient platformsClient,
            [LtiAdvantage] INrpsClient nrpsClient,
            [Lti1] Lti1MembershipClient membershipClient)
        {
            AssignmentEntity assignmentEntity = await FetchAssignment(table, assignmentId);
            if (assignmentEntity == null)
                return new NotFoundResult();

            AssignmentDto assignmentDto = _mapper.Map<AssignmentDto>(assignmentEntity);

            var res = await ValidateUser(req, assignmentDto, platformsClient, nrpsClient, membershipClient);
            if (res.GetType() != typeof(OkResult))
                return res;

            return await ChangePublishStatus(assignmentEntity, assignmentEntityCollector, PublishStatus.Published);
        }

        [FunctionName(nameof(UnpublishAssignment))]
        public async Task<IActionResult> UnpublishAssignment(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = AssignmentsRoutePath + "/{assignmentId}/unpublish")] HttpRequest req,
            [Table(AssignmentsTableName)] CloudTable table,
            [Table(AssignmentsTableName)] IAsyncCollector<AssignmentEntity> assignmentEntityCollector,
            string assignmentId,
            [Platform] PlatformsClient platformsClient,
            [LtiAdvantage] INrpsClient nrpsClient,
            [Lti1] Lti1MembershipClient membershipClient)
        {
            AssignmentEntity assignmentEntity = await FetchAssignment(table, assignmentId);
            if (assignmentEntity == null)
                return new NotFoundResult();

            AssignmentDto assignmentDto = _mapper.Map<AssignmentDto>(assignmentEntity);

            var res = await ValidateUser(req, assignmentDto, platformsClient, nrpsClient, membershipClient);
            if (res.GetType() != typeof(OkResult))
                return res;

            return await ChangePublishStatus(assignmentEntity, assignmentEntityCollector, PublishStatus.NotPublished);
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

        private async Task<IActionResult> ChangePublishStatus(AssignmentEntity assignmentEntity, IAsyncCollector<AssignmentEntity> assignmentEntityCollector, PublishStatus newPublishStatus)
        {
            assignmentEntity.PublishStatus = newPublishStatus.ToString();
            assignmentEntity.ETag = "*";

            await assignmentEntityCollector.AddAsync(assignmentEntity);
            await assignmentEntityCollector.FlushAsync();

            _logger.LogInformation($"Changed Published status to {assignmentEntity.PublishStatus}");

            return new OkResult();
        }
    
        private async Task<IActionResult> ValidateUser(HttpRequest req, AssignmentDto assignmentDto, PlatformsClient platformsClient, INrpsClient nrpsClient, Lti1MembershipClient membershipClient)
        {
            if (!req.Headers.TryGetUserEmails(out List<string> userEmails))
            {
                _logger.LogError("Could not get user email.");
                return new BadRequestErrorMessageResult("Bad Request: Could not get user email.");
            }

            if (userEmails.Count > 0)
            {
                if (assignmentDto.LtiVersion != LtiAdvantageVersionString)
                {
                    Membership userMembership = await membershipClient.GetMemberByEmail(assignmentDto.ContextMembershipsUrl, assignmentDto.OAuthConsumerKey, assignmentDto.ResourceLinkId, userEmails);
                    if (userMembership == null)
                    {
                        _logger.LogError("no members");
                        return new BadRequestErrorMessageResult("Bad Request: no members");
                    }
                    var role = userMembership.Role;
                    if (role.Equals("Learner"))
                    {
                        _logger.LogError("Students cannot update an assignment");
                        return new UnauthorizedResult();
                    }
                }
                else
                {
                    Platform platform = await platformsClient.GetPlatform(assignmentDto.PlatformId);
                    Member member = await nrpsClient.GetByEmail(platform.ClientId, platform.AccessTokenUrl, assignmentDto.ContextMembershipsUrl, userEmails);
                    if (member == null)
                    {
                        _logger.LogError("no members");
                        return new BadRequestErrorMessageResult("Bad Request: no members");
                    }
                    var roles = member.Roles;
                    if (roles.Contains(Role.ContextLearner) || roles.Contains(Role.InstitutionLearner))
                    {
                        _logger.LogError("Students cannot update an assignment");
                        return new UnauthorizedResult();
                    }
                }
            }

            _logger.LogInformation("Valid user");

            return new OkResult();
        }
    }
}