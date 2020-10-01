// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using IdentityModel.Jwk;
using System.Threading.Tasks;

namespace Edna.Bindings.LtiAdvantage.Services
{
    public interface IKeyVaultJwkProvider
    {
        Task<JsonWebKey> GetJwk(string keyVaultIdentifier);
    }
}