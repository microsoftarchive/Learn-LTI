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

        public static bool TryGetUserEmails(this IHeaderDictionary headers, out List<string> userEmails, Action<string> logAction = null)
        {
            userEmails = new List<string>();
            if (!headers.TryGetTokenClaims(out Claim[] claims, logAction))
            {
                logAction?.Invoke("Error in sent JWT");
                return false;
            }

            return GetClientAuthenticationType(claims, out userEmails, logAction);
        }

        private static bool GetClientAuthenticationType(Claim[] claims, out List<string> userEmails, Action<string> logAction = null)
        {
            userEmails = new List<string>();

            // By checking appidacr claim, we can know if the call was made by a user or by the system.
            // https://docs.microsoft.com/en-us/azure/active-directory/develop/access-tokens
            string appidacr = claims.FirstOrDefault(claim => claim.Type == "appidacr")?.Value;

            // appidacr exists so this is an AAD token
            if(appidacr != null){
                switch (appidacr)
                {
                    case "0":
                        //appidacr 0: authenticate  user using ParseUserEmails from claims
                        return ParseUserEmailsFromClaims(claims, out userEmails);

                    case "2":
                        //appidacr 2: authed because its from server
                        return true;

                    default:
                        //appidacr default: this is neither a valid call from user nor a valid server to server call
                        logAction?.Invoke("this is neither a valid call from user nor a valid server to server call");
                        return false;
                }
            }

            // else appidacr is null so this is a B2C Token
            else{
                //b2c authenticate  user using ParseUserEmails from claims by default
                return ParseUserEmailsFromClaims(claims, out userEmails);
            }
            // TODO - at a later point add check that this is definitely a b2c token and then have the else to hadnle if it is neither AAD or B2C
            // TODO- need to find a way to identify b2c tokens, same issue in PlatformApi.cs
        }

        private static bool ParseUserEmailsFromClaims(Claim[] claims, out List<String> userEmails)
        {
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