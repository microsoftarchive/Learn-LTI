// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;

namespace Edna.Utils.Http
{
    public static class HttpClaimsExtension
    {
        private static readonly string[] PossibleEmailClaimTypes = { "email", "upn", "unique_name" };

        public static string GetClientAuthenticationType(Claim[] claims, Action<string> logAction = null)
        {
            // By checking appidacr claim, we can know if the call was made by a user or by the system.
            // https://docs.microsoft.com/en-us/azure/active-directory/develop/access-tokens
            string appidacr = claims.FirstOrDefault(claim => claim.Type == "appidacr")?.Value;

            if(appidacr != "0" && appidacr != "2")
                logAction?.Invoke("this is neither a valid call from user nor a valid server to server call");

            return appidacr;
        }

        public static bool TryGetUserEmails(Claim[] claims, out List<String> userEmails)
        {
            userEmails = new List<string>();
            if (claims == null)
                return false;

            userEmails = PossibleEmailClaimTypes
                .Select(claimType => claims.FirstOrDefault(claim => claim.Type == claimType))
                .Where(claim => claim != null)
                .Select(claim => claim.Value)
                .Distinct()
                .ToList();
            return userEmails.Any();
        }
    }
}
