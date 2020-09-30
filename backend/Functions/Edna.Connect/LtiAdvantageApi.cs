using System;
using System.Collections.Specialized;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using Edna.Bindings.Assignment.Attributes;
using Edna.Bindings.Assignment.Models;
using Edna.Bindings.LtiAdvantage.Attributes;
using Edna.Bindings.LtiAdvantage.Models;
using Edna.Bindings.LtiAdvantage.Services;
using Edna.Bindings.Platform.Attributes;
using Edna.Bindings.Platform.Models;
using IdentityModel.Jwk;
using LtiAdvantage.Lti;
using LtiAdvantage.NamesRoleProvisioningService;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.DurableTask;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;

namespace Edna.Connect
{
    public class LtiAdvantageApi
    {
        private static readonly string RedirectUrl = Environment.GetEnvironmentVariable("RedirectUrl").TrimEnd('/');

        private readonly ILogger<LtiAdvantageApi> _logger;

        public LtiAdvantageApi(ILogger<LtiAdvantageApi> logger)
        {
            _logger = logger;
        }

        [FunctionName(nameof(OidcLogin))]
        public async Task<IActionResult> OidcLogin(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = "oidc-login/{platformId}")] HttpRequest req,
            [Platform(PlatformId = "{platformId}")] Platform platform,
            [LtiAdvantage] OidcClient oidcClient,
            [DurableClient] IDurableOrchestrationClient orchestrationClient)
        {
            NameValueCollection redirectQueryParams = oidcClient.GetRedirectQueryParams(platform.ClientId);
            string nonce = Guid.NewGuid().ToString();
            string state = Guid.NewGuid().ToString();

            string instanceId = await orchestrationClient.StartNewAsync(nameof(SaveState), (object)(nonce, state));
            await orchestrationClient.WaitForCompletionOrCreateCheckStatusResponseAsync(req, instanceId);

            redirectQueryParams["nonce"] = nonce;
            redirectQueryParams["state"] = state;

            string queryParams = redirectQueryParams.ToString();

            string redirectUrl = $"{platform.AuthorizationUrl}?{queryParams}";
            return new RedirectResult(redirectUrl);
        }

        [FunctionName(nameof(SaveState))]
        public async Task SaveState([OrchestrationTrigger] IDurableOrchestrationContext context)
        {
            (string nonce, string state) = context.GetInput<(string, string)>();

            EntityId nonceEntityId = new EntityId(nameof(Nonce), nonce);
            await context.CallEntityAsync(nonceEntityId, nameof(Nonce.SetState), state);
        }

        [FunctionName(nameof(LtiAdvantageLaunch))]
        public async Task<IActionResult> LtiAdvantageLaunch(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "lti-advantage-launch/{platformId}")] HttpRequest req,
            [LtiAdvantage] ILtiResourceLinkRequestClient ltiRequestClient,
            [LtiAdvantage] INrpsClient nrpsClient,
            [Platform(PlatformId = "{platformId}")] Platform platform,
            [Assignment] IAsyncCollector<Assignment> assignmentsCollector,
            [DurableClient] IDurableEntityClient entityClient,
            string platformId)
        {
            LtiResourceLinkRequest ltiResourceLinkRequest = null;
            try
            {
                ltiResourceLinkRequest= await ltiRequestClient.GetLtiResourceLinkRequest(platform.JwkSetUrl, platform.ClientId, platform.Issuer);
            }
            catch(Exception e)
            {
                _logger.LogError($"Could not validate request.\n{e}");
            }
            if (ltiResourceLinkRequest == null)
                return new BadRequestErrorMessageResult("Could not validate request.");

            string nonce = ltiResourceLinkRequest.Nonce;
            string state = req.Form["state"].ToString();

            bool isNonceValid = await ValidateNonce(nonce, state, entityClient);
            if (!isNonceValid)
                return new BadRequestErrorMessageResult("Could not validate nonce.");

            Assignment assignment = ConvertRequestToAssignment(ltiResourceLinkRequest);
            assignment.PlatformId = platformId;
            _logger.LogTrace($"Parsed Assignment '{assignment.Name}'.");

            await assignmentsCollector.AddAsync(assignment);
            await assignmentsCollector.FlushAsync();

            string asStudentParam = "";
            if (ltiResourceLinkRequest.Roles.Contains(Role.ContextLearner) || ltiResourceLinkRequest.Roles.Contains(Role.InstitutionLearner))
            {
                Member launchingMember = await nrpsClient.GetById(platform.ClientId, platform.AccessTokenUrl, ltiResourceLinkRequest.NamesRoleService.ContextMembershipUrl, ltiResourceLinkRequest.UserId);
                if (launchingMember != null && (launchingMember.Roles.Contains(Role.ContextInstructor) || launchingMember.Roles.Contains(Role.InstitutionInstructor)))
                    asStudentParam = "?asStudent";
            }

            var urlWithParams = $"{RedirectUrl}/{assignment.Id}{asStudentParam}";
            _logger.LogInformation($"Redirect to {urlWithParams}");

            return new RedirectResult(urlWithParams);
        }

        [FunctionName(nameof(Jwks))]
        public IActionResult Jwks(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "jwks/{platformId}")] HttpRequest req,
            [LtiAdvantage] LtiToolPublicKey publicKey
)
        {
            var jwks = new JsonWebKeySet();
            jwks.Keys.Add(publicKey.Jwk);
            return new OkObjectResult(jwks);

        }

        private Assignment ConvertRequestToAssignment(LtiResourceLinkRequest ltiRequest)
        {
            return new Assignment
            {
                ContextId = ltiRequest.Context.Id,
                ResourceLinkId = ltiRequest.ResourceLink.Id,
                Name = ltiRequest.ResourceLink.Title,
                CourseName = ltiRequest.Context.Title,
                LtiVersion = ltiRequest.Version,
                ContextMembershipsUrl = ltiRequest.NamesRoleService.ContextMembershipUrl
            };
        }

        private async Task<bool> ValidateNonce(string nonce, string state, IDurableEntityClient entityClient)
        {
            EntityId nonceEntityId = new EntityId(nameof(Nonce), nonce);

            EntityStateResponse<Nonce> nonceEntityResponse = await GetEntityStateWithRetries<Nonce>(nonceEntityId, entityClient);
            if (!nonceEntityResponse.EntityExists)
            {
                _logger.LogWarning($"Entity {nonceEntityId.EntityKey} does not exist.");
                return false;
            }

            if (state != nonceEntityResponse.EntityState.State)
            {
                _logger.LogWarning("The form state does not match the nonce.");
                return false;
            }

            await entityClient.SignalEntityAsync(nonceEntityId, nameof(Nonce.Delete));
            return true;
        }

        private async Task<EntityStateResponse<T>> GetEntityStateWithRetries<T>(EntityId entityId, IDurableEntityClient entityClient, int retriesNumber = 3)
        {
            EntityStateResponse<T> entityResponse = default;
            for (int i = 0; i < retriesNumber; i++)
            {
                entityResponse = await entityClient.ReadEntityStateAsync<T>(entityId);
                if (entityResponse.EntityExists)
                    break;

                await Task.Delay(500);
            }

            return entityResponse;
        }
    }
}