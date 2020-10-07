// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using System.Collections.Generic;
using System.Threading.Tasks;
using LtiAdvantage.NamesRoleProvisioningService;

namespace Edna.Bindings.LtiAdvantage.Services
{
    public interface INrpsClient
    {
        Task<IEnumerable<Member>> Get(string clientId, string tokenUrl, string membershipUrl);
        Task<Member> GetByEmail(string clientId, string tokenUrl, string membershipUrl, IEnumerable<string> userEmails);
        Task<Member> GetById(string clientId, string tokenUrl, string membershipUrl, string userId);
    }
}