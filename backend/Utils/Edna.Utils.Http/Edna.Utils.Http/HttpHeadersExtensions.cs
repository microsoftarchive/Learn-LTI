// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Logging;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;

namespace Edna.Utils.Http
{
    public static class HttpHeadersExtensions
    {
        private static readonly JwtSecurityTokenHandler JwtSecurityTokenHandler = new JwtSecurityTokenHandler();

        public static async Task<bool> ValidateToken(this IHeaderDictionary headers, 
            IConfigurationManager<OpenIdConnectConfiguration> adConfigurationManager, 
            IConfigurationManager<OpenIdConnectConfiguration> b2CConfigurationManager, 
            string validAudience, Action<string> logAction = null)
        {
            if (!headers.ContainsKey("Authorization"))
            {
                logAction?.Invoke("No Authorization header was found in the request.");
                return false;
            }

            var authorizationContent = headers["Authorization"].ToString();
            var token = authorizationContent?.Split(' ')[1];
            try
            {
                var adConfig = await adConfigurationManager.GetConfigurationAsync(default);
                var signingKeys = adConfig.SigningKeys;
                var validIssuers = new List<string> { adConfig.Issuer };
                if (b2CConfigurationManager != null)
                {
                    var b2CConfig = await b2CConfigurationManager.GetConfigurationAsync(default);
                    foreach (var key in b2CConfig.SigningKeys)
                        signingKeys.Add(key);
                    validIssuers.Add(b2CConfig.Issuer);
                }
                var validationParameters = new TokenValidationParameters
                {
                    ValidateAudience = true,
                    ValidateIssuer = true,
                    ValidateIssuerSigningKey = true,
                    ValidateLifetime = true,
                    RequireSignedTokens = true,
                    IssuerSigningKeys = signingKeys,
                    ValidIssuers = validIssuers,
                    ValidAudiences = validAudience.Split(',')
                };
                var principal = JwtSecurityTokenHandler.ValidateToken(token, validationParameters, out _);
                return !(principal is null);
            }
            catch (Exception e)
            {
                logAction?.Invoke(token + e + "Error when validating the user token.");
            }
            return false;
        }

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