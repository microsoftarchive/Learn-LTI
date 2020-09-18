// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using System.Threading.Tasks;

namespace Edna.Bindings.LtiAdvantage.Services
{
    public interface IKeyVaultPemKeyProvider
    {
        Task<string> GetPemKey(string keyVaultIdentifier);
    }
}