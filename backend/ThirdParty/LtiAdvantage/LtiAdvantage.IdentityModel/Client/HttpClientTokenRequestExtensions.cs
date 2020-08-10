using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using IdentityModel;
using IdentityModel.Client;

namespace LtiAdvantage.IdentityModel.Client
{
    /// <summary>
    /// HttpClient extensions for OAuth token requests.
    /// </summary>
    public static class HttpClientTokenRequestExtensions
    {
        /// <summary>
        /// Request a token based on client credentials with a signed JWT.
        /// </summary>
        /// <remarks>
        /// Based on https://www.imsglobal.org/spec/security/v1p0/#using-json-web-tokens-with-oauth-2-0-client-credentials-grant.
        /// </remarks>
        /// <param name="client">The client.</param>
        /// <param name="request">The request.</param>
        /// <param name="cancellationToken">The cancellation token.</param>
        /// <returns></returns>
        public static async Task<TokenResponse> RequestClientCredentialsTokenWithJwtAsync(this HttpMessageInvoker client, 
            JwtClientCredentialsTokenRequest request, CancellationToken cancellationToken = default(CancellationToken))
        {
            request.GrantType = OidcConstants.GrantTypes.ClientCredentials;
            request.ClientAssertion = new ClientAssertion
            {
                Type = OidcConstants.ClientAssertionTypes.JwtBearer,
                Value = request.Jwt
            };
            if (!string.IsNullOrWhiteSpace(request.Scope))
            {
                request.Parameters.Add(OidcConstants.TokenRequest.Scope, request.Scope);
            }

            return await client.RequestTokenAsync(request, cancellationToken);
        }
    }
}
