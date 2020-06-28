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

namespace Edna.Assignments
{
    public class AssignmentsApi
    {
        private const string AssignmentsTableName = "Assignments";
        private const string AssignmentsRoutePath = "assignments";

        private readonly ILogger<AssignmentsApi> _logger;
        private readonly IMapper _mapper;

        public AssignmentsApi(IMapper mapper, ILogger<AssignmentsApi> logger)
        {
            _logger = logger;
            _mapper = mapper;
        }

        [FunctionName(nameof(CreateOrUpdateAssignment))]
        public async Task<IActionResult> CreateOrUpdateAssignment(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = AssignmentsRoutePath)] HttpRequest request,
            [Table(AssignmentsTableName)] CloudTable assignmentsTable)
        {
            string result = await request.ReadAsStringAsync();

            AssignmentDto assignmentDto = JsonConvert.DeserializeObject<AssignmentDto>(result);
            AssignmentEntity assignmentEntity = _mapper.Map<AssignmentEntity>(assignmentDto);
            assignmentEntity.ETag = "*";

            TableOperation insertOrMergeAssignment = TableOperation.InsertOrMerge(assignmentEntity);
            TableResult insertOrMergeResult = await assignmentsTable.ExecuteAsync(insertOrMergeAssignment);
            if (insertOrMergeResult.HttpStatusCode < 200 || insertOrMergeResult.HttpStatusCode >= 300)
            {
                _logger.LogError($"Could not save assignment {assignmentEntity.ToAssignmentId()}. Error code: {insertOrMergeResult.HttpStatusCode}.");
                return new InternalServerErrorResult();
            }

            _logger.LogInformation($"Saved assignment {assignmentEntity.ToAssignmentId()}.");

            string assignmentUrl = $"{request.Scheme}://{request.Host}/api/{AssignmentsRoutePath}/{assignmentEntity.ToAssignmentId()}";
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

            Platform platform = await platformsClient.GetPlatform(assignmentEntity.PlatformId);

            AssignmentDto assignmentDto = _mapper.Map<AssignmentDto>(assignmentEntity);
            assignmentDto.PlatformPersonalization = _mapper.Map<PlatformPersonalizationDto>(platform);

            return new OkObjectResult(assignmentDto);
        }

        [FunctionName(nameof(PublishAssignment))]
        public Task<IActionResult> PublishAssignment(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = AssignmentsRoutePath + "/{assignmentId}/publish")] HttpRequest req,
            [Table(AssignmentsTableName)] CloudTable table,
            [Table(AssignmentsTableName)] IAsyncCollector<AssignmentEntity> assignmentEntityCollector,
            string assignmentId)
        {
            return ChangePublishStatus(table, assignmentEntityCollector, assignmentId, PublishStatus.Published);
        }

        [FunctionName(nameof(UnpublishAssignment))]
        public Task<IActionResult> UnpublishAssignment(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = AssignmentsRoutePath + "/{assignmentId}/unpublish")] HttpRequest req,
            [Table(AssignmentsTableName)] CloudTable table,
            [Table(AssignmentsTableName)] IAsyncCollector<AssignmentEntity> assignmentEntityCollector,
            string assignmentId)
        {
            return ChangePublishStatus(table, assignmentEntityCollector, assignmentId, PublishStatus.NotPublished);
        }

        private async Task<AssignmentEntity> FetchAssignment(CloudTable table, string assignmentId)
        {
            var (partitionKey, rowKey) = assignmentId.ToEntityIdentifiers();

            TableOperation retrieveOperation = TableOperation.Retrieve<AssignmentEntity>(partitionKey, rowKey);

            TableResult retrieveResult = await table.ExecuteAsync(retrieveOperation);

            if (retrieveResult.Result == null || !(retrieveResult.Result is AssignmentEntity assignmentEntity))
                return null;

            return assignmentEntity;
        }

        private async Task<IActionResult> ChangePublishStatus(CloudTable table, IAsyncCollector<AssignmentEntity> assignmentEntityCollector, string assignmentId, PublishStatus newPublishStatus)
        {
            AssignmentEntity assignmentEntity = await FetchAssignment(table, assignmentId);
            if (assignmentEntity == null)
                return new NotFoundResult();

            assignmentEntity.PublishStatus = newPublishStatus.ToString();
            assignmentEntity.ETag = "*";

            await assignmentEntityCollector.AddAsync(assignmentEntity);
            await assignmentEntityCollector.FlushAsync();

            return new OkResult();
        }
    }
}
