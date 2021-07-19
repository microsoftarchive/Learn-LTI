// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Edna.Bindings.Assignment.Attributes;
using Edna.Bindings.Assignment.Models;
using Edna.Bindings.Lti1;
using Edna.Bindings.LtiAdvantage.Attributes;
using Edna.Bindings.LtiAdvantage.Services;
using Edna.Bindings.Platform;
using Edna.Bindings.Platform.Attributes;
using Edna.Bindings.Platform.Models;
using Edna.Utils.Http;
using LtiAdvantage.NamesRoleProvisioningService;
using LtiLibrary.NetCore.Lis.v2;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;

namespace Edna.Users
{
    public class UsersApi
    {
        private readonly IMapper _mapper;
        private readonly ILogger<UsersApi> _logger;

        public UsersApi(IMapper mapper, ILogger<UsersApi> logger)
        {
            _mapper = mapper;
            _logger = logger;
        }

        [FunctionName(nameof(GetUserDetails))]
        public async Task<IActionResult> GetUserDetails(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "assignments/{assignmentId}/me")] HttpRequest req,
            [Assignment(AssignmentId = "{assignmentId}")] Assignment assignment,
            [Platform] PlatformsClient platformsClient,
            [LtiAdvantage] INrpsClient nrpsClient,
            [Lti1] Lti1MembershipClient membershipClient)
        {
            _logger.LogTrace("Getting user information from JWT.");

            if (req.Headers == null)
                return new BadRequestErrorMessageResult("No headers are presented in the request.");

            if (!req.Headers.TryGetUserEmails(out List<string> userEmails))
                return new BadRequestErrorMessageResult("Could not get user email.");

            _logger.LogInformation($"Getting user information for '{string.Join(';', userEmails)}'.");

            if (assignment.LtiVersion.ToString() != LtiVersionClass.LtiVersion.LtiAdvantage.ToString())
            {
                Membership userMembership = await membershipClient.GetMemberByEmail(assignment.ContextMembershipsUrl, assignment.OAuthConsumerKey, assignment.ResourceLinkId, userEmails);
                return new OkObjectResult(_mapper.Map<MemberDto>(userMembership));
            }

            Platform platform = await platformsClient.GetPlatform(assignment.PlatformId);
            
            _logger.LogInformation($"platform.ClientId = '{platform.ClientId}'.");
            _logger.LogInformation($"platform.AccessTokenUrl = '{platform.AccessTokenUrl}'.");
            _logger.LogInformation($"assignment.ContextMembershipsUrl = '{assignment.ContextMembershipsUrl}'.");
            
            int count = 0;
            foreach (string s in userEmails) {
                count ++;
                _logger.LogInformation($"No.{count} userEmails = '{s}'.");
            }
            
            Member member = await nrpsClient.GetByEmail(platform.ClientId, platform.AccessTokenUrl, assignment.ContextMembershipsUrl, userEmails);
            // Member member = await nrpsClient.GetById(platform.clientId, platform.AccessTokenUrl, assignment.ContextMembershipUrl, ***string userId***);

            if (member == null)
                _logger.LogError("User not enrolled.");

            return new OkObjectResult(_mapper.Map<MemberDto>(member));
        }

        [FunctionName(nameof(GetAllUsers))]
        public async Task<IActionResult> GetAllUsers(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "assignments/{assignmentId}/users")] HttpRequest req,
            [Assignment(AssignmentId = "{assignmentId}")] Assignment assignment,
            [Platform] PlatformsClient platformsClient,
            [LtiAdvantage] INrpsClient nrpsClient,
            [Lti1] Lti1MembershipClient membershipClient)
        {
            _logger.LogInformation("Getting all users");

            if (assignment.LtiVersion.ToString() != LtiVersionClass.LtiVersion.LtiAdvantage.ToString())
            {
                IEnumerable<Membership> allMemberships = await membershipClient.GetAllMembers(assignment.ContextMembershipsUrl, assignment.OAuthConsumerKey, assignment.ResourceLinkId);
                return new OkObjectResult(allMemberships.Select(_mapper.Map<MemberDto>));
            }

            Platform platform = await platformsClient.GetPlatform(assignment.PlatformId);
            IEnumerable<Member> allMembers = await nrpsClient.Get(platform.ClientId, platform.AccessTokenUrl, assignment.ContextMembershipsUrl);

            return new OkObjectResult(allMembers.Select(_mapper.Map<MemberDto>));
        }
    }
}
