// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using System.Threading.Tasks;
using IdentityModel.Client;

namespace Edna.Bindings.LtiAdvantage.Services
{
    public interface IAccessTokenService
    {
        Task<TokenResponse> GetAccessTokenAsync(string clientId, string accessTokenEndpoint, string audience, string scope, string keyVaultKeyString);
    }
}