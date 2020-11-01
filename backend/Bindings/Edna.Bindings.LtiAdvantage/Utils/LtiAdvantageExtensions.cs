// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using Edna.Utils.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json.Linq;

namespace Edna.Bindings.LtiAdvantage.Utils
{
    public static class LtiAdvantageExtensions
    {
        public static async Task<ClaimsPrincipal> GetValidatedLtiLaunchClaims(this HttpRequest request, string jwkSetUrl, string clientId, string issuer)
        {
            if (!request.Form.TryGetValue("id_token", out var idTokenValue))
                throw new NullReferenceException("No ID token is presented in the http request.");

            using HttpClient client = new HttpClient(new EdnaExternalHttpHandler());
            string certsJsonString = await client.GetStringAsync(jwkSetUrl);
            JObject certsJObject = JObject.Parse(certsJsonString);
            JArray keysJToken = certsJObject["keys"] as JArray;
            IEnumerable<JsonWebKey> keys = keysJToken?
                .Select(key => key.ToString())
                .Select(s => new JsonWebKey(s))
                ?? Enumerable.Empty<JsonWebKey>();

            TokenValidationParameters validationParameters = new TokenValidationParameters
            {
                RequireAudience = true,
                ValidAudience = clientId,
                ValidIssuer = issuer,
                IssuerSigningKeys = keys
            };

            JwtSecurityTokenHandler jwtSecurityTokenHandler = new JwtSecurityTokenHandler { InboundClaimTypeMap = { ["sub"] = "sub" } };

            return jwtSecurityTokenHandler.ValidateToken(idTokenValue.ToString(), validationParameters, out _);
        }
    }
}