using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace Edna.Utils.Http
{
    public static class HttpHeadersExtensions
    {
        private static readonly JwtSecurityTokenHandler JwtSecurityTokenHandler = new JwtSecurityTokenHandler();

        public static bool TryGetTokenClaims(this IHeaderDictionary headers, out Claim[] claims, Action<string> logAction = null)
        {
            claims = null;

            if (!headers.ContainsKey("Authorization"))
            {
                logAction?.Invoke("No Authorization header was found in the request.");
                return false;
            }

            string authorizationContent = headers["Authorization"].ToString();
            string token = authorizationContent?.Split(' ')[1];

            if (string.IsNullOrEmpty(token))
            {
                logAction?.Invoke("Could not get JWT from the request.");
                return false;
            }

            if (!(JwtSecurityTokenHandler.ReadToken(token) is JwtSecurityToken jwt))
            {
                logAction?.Invoke("Token is not a valid JWT.");
                return false;
            }

            claims = jwt.Claims.ToArray();
            return true;
        }
    }
}