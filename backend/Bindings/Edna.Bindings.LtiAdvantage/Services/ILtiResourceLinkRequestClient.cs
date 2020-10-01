// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using System.Threading.Tasks;
using LtiAdvantage.Lti;

namespace Edna.Bindings.LtiAdvantage.Services
{
    public interface ILtiResourceLinkRequestClient
    {
        Task<LtiResourceLinkRequest> GetLtiResourceLinkRequest(string jwkSetUrl, string clientId, string issuer);
    }
}