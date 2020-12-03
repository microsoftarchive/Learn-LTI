// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Edna.Utils.Http;
using LtiLibrary.NetCore.Clients;
using LtiLibrary.NetCore.Common;
using LtiLibrary.NetCore.Lis.v2;
using Microsoft.Extensions.Logging;

namespace Edna.Bindings.Lti1
{
    public class Lti1MembershipClient
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<Lti1MembershipClient> _logger;
        private static readonly string ToolSecret = Environment.GetEnvironmentVariable("Lti1Secret");

        public Lti1MembershipClient(IHttpClientFactory httpClientFactory, ILogger<Lti1MembershipClient> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        public async Task<IEnumerable<Membership>> GetAllMembers(string membershipUrl, string key, string resourceLinkId)
        {
            using (HttpClient httpClient = _httpClientFactory.CreateClient(EdnaExternalHttpHandler.Name))
            {
                ClientResponse<List<Membership>> membershipResponse = await MembershipClient.GetMembershipAsync(httpClient, membershipUrl, key, ToolSecret, resourceLinkId);

                if (membershipResponse.Exception != null)
                {
                    _logger.LogError(membershipResponse.Exception, "Failed to fetch LTI1 users.");
                    return Enumerable.Empty<Membership>();
                }

                return membershipResponse.Response;
            }
        }

        public async Task<Membership> GetMemberByEmail(string membershipUrl, string key, string resourceLinkId, IEnumerable<string> userEmails)
        {
            IEnumerable<Membership> allMembers = await GetAllMembers(membershipUrl, key, resourceLinkId);
            return allMembers.FirstOrDefault(membership => userEmails.Any(userEmail => membership.Member.Email.Equals(userEmail)));
        }
    }
}