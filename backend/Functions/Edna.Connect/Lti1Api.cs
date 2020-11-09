// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using System;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using Edna.Bindings.Assignment.Attributes;
using Edna.Bindings.Assignment.Models;
using LtiLibrary.AspNetCore.Extensions;
using LtiLibrary.NetCore.Lti.v1;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;

namespace Edna.Connect
{
    public class Lti1Api
    {
        private static readonly string ToolSecret = Environment.GetEnvironmentVariable("Lti1Secret");
        private static readonly string RedirectUrl = Environment.GetEnvironmentVariable("RedirectUrl").TrimEnd('/');

        private readonly ILogger<Lti1Api> _logger;

        public Lti1Api(ILogger<Lti1Api> logger)
        {
            _logger = logger;
        }

        [FunctionName(nameof(Lti1Launch))]
        public async Task<IActionResult> Lti1Launch(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "launch-lti1")] HttpRequest req,
            [Assignment] IAsyncCollector<Assignment> assignmentsCollector)
        {
            _logger.LogInformation("New LMS Connection");

            LtiRequest ltiRequest = await req.ParseLtiRequestAsync();
            
            _logger.LogTrace("Parsed Lti Request");
            if (ltiRequest == null)
            {
                _logger.LogError("Failed to parse Http Request to LTI Request data");
                return new BadRequestObjectResult("Failed to parse Http Request to LTI Request data");
            }

            string requestSignature = ltiRequest.GenerateSignature(ToolSecret);

            if (ltiRequest.Signature != requestSignature)
            {
                _logger.LogError("Signatures don't match.");
                return new UnauthorizedResult();
            }

            Assignment assignment = ConvertRequestToAssignment(ltiRequest);
            _logger.LogTrace($"Parsed Assignment {assignment.Name}");

            await assignmentsCollector.AddAsync(assignment);
            await assignmentsCollector.FlushAsync();

            if (string.IsNullOrEmpty(assignment.Id))
                return new InternalServerErrorResult();

            string urlWithParams = $"{RedirectUrl}/{assignment.Id}";
            _logger.LogInformation($"Redirect to {urlWithParams}");

            return new RedirectResult(urlWithParams, true);
        }

        private Assignment ConvertRequestToAssignment(LtiRequest ltiRequest)
        {
            return new Assignment
            {
                ContextId = ltiRequest.ContextId,
                ResourceLinkId = ltiRequest.ResourceLinkId,
                Name = ltiRequest.ResourceLinkTitle,
                CourseName = ltiRequest.ContextTitle,
                LtiVersion = ltiRequest.Version,
                ContextMembershipsUrl = ltiRequest.Parameters.FirstOrDefault(pair => pair.Key == "custom_context_memberships_url").Value,
                OAuthConsumerKey = ltiRequest.ConsumerKey
            };
        }
    }
}