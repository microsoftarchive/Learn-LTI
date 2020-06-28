using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
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
        private static readonly string[] PossibleEmailClaimTypes = { "email", "upn", "unique_name" };
        private const string LtiAdvantageVersionString = "1.3.0";

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

            if (!req.Headers.TryGetTokenClaims(out Claim[] claims, message => _logger.LogError(message)))
                return new BadRequestErrorMessageResult("Error in sent JWT.");

            if (!TryGetUserEmails(claims, out List<string> userEmails))
                return new BadRequestErrorMessageResult("Could not get user email.");

            _logger.LogInformation($"Getting user information for '{userEmails.ToString()}'.");

            if (assignment.LtiVersion != LtiAdvantageVersionString)
            {
                Membership userMembership = await membershipClient.GetMemberByEmail(assignment.ContextMembershipsUrl, assignment.OAuthConsumerKey, assignment.ResourceLinkId, userEmails);
                return new OkObjectResult(_mapper.Map<MemberDto>(userMembership));
            }

            Platform platform = await platformsClient.GetPlatform(assignment.PlatformId);
            Member member = await nrpsClient.GetByEmail(platform.ClientId, platform.AccessTokenUrl, assignment.ContextMembershipsUrl, userEmails);

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

            if (assignment.LtiVersion != LtiAdvantageVersionString)
            {
                IEnumerable<Membership> allMemberships = await membershipClient.GetAllMembers(assignment.ContextMembershipsUrl, assignment.OAuthConsumerKey, assignment.ResourceLinkId);
                return new OkObjectResult(allMemberships.Select(_mapper.Map<MemberDto>));
            }

            Platform platform = await platformsClient.GetPlatform(assignment.PlatformId);
            IEnumerable<Member> allMembers = await nrpsClient.Get(platform.ClientId, platform.AccessTokenUrl, assignment.ContextMembershipsUrl);

            return new OkObjectResult(allMembers.Select(_mapper.Map<MemberDto>));
        }

        private bool TryGetUserEmails(IEnumerable<Claim> claims, out List<string> userEmails)
        {
            userEmails = new List<string>();
            if (claims == null)
                return false;

            Claim[] claimsArray = claims.ToArray();

            userEmails = PossibleEmailClaimTypes
                .Select(claimType => claimsArray.FirstOrDefault(claim => claim.Type == claimType))
                .Where(claim => claim != null)
                .Select(claim => claim.Value)
                .Distinct()
                .ToList();

            return userEmails.Any();
        }
    }
}
