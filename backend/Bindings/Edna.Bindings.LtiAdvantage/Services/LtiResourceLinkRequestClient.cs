using System.Security.Claims;
using System.Threading.Tasks;
using Edna.Bindings.LtiAdvantage.Utils;
using LtiAdvantage.Lti;
using Microsoft.AspNetCore.Http;

namespace Edna.Bindings.LtiAdvantage.Services
{
    internal class LtiResourceLinkRequestClient : ILtiResourceLinkRequestClient
    {
        private readonly HttpRequest _httpRequest;

        public LtiResourceLinkRequestClient(HttpRequest httpRequest)
        {
            _httpRequest = httpRequest;
        }

        public async Task<LtiResourceLinkRequest> GetLtiResourceLinkRequest(string jwkSetUrl, string clientId, string issuer)
        {
            ClaimsPrincipal claimsPrincipal = await _httpRequest.GetValidatedLtiLaunchClaims(jwkSetUrl, clientId, issuer);

            return new LtiResourceLinkRequest(claimsPrincipal.Claims);
        }
    }
}