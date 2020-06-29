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

namespace Edna.AssignmentLinks
{
    public class AssignmentLinksApi
    {
        private readonly ILogger<AssignmentLinksApi> _logger;
        private readonly IMapper _mapper;
        private const string AssignmentLinksTableName = "Links";

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
            string linkId)
        {
            string linkJson = await req.ReadAsStringAsync();
            AssignmentLinkDto linkDto = JsonConvert.DeserializeObject<AssignmentLinkDto>(linkJson);

            if (linkId != linkDto.Id)
                return new BadRequestErrorMessageResult("The provided link content doesn't match the path.");

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
            [Table(AssignmentLinksTableName, "{assignmentId}", "{linkId}")] AssignmentLinkEntity entityToDelete)
        {
            if (entityToDelete == null)
                return new OkResult();

            TableOperation deleteTable = TableOperation.Delete(entityToDelete);
            TableResult deleteResult = await assignmentLinksTable.ExecuteAsync(deleteTable);

            if (deleteResult.HttpStatusCode < 200 || deleteResult.HttpStatusCode >= 300)
                return new InternalServerErrorResult();

            return new OkResult();
        }
    }
}