// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using IdentityModel.Client;
using LtiAdvantage;
using LtiAdvantage.NamesRoleProvisioningService;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Edna.Utils.Http;

namespace Edna.Bindings.LtiAdvantage.Services
{
    /// <summary>
    /// Names and Roles Provisioning Services Client, as described in <see href="https://www.imsglobal.org/spec/lti-nrps/v2p0">IMS GLOBAL Official Docs</see>
    /// </summary>
    public class NrpsClient : INrpsClient
    {
        private readonly string _keyVaultKeyString;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IAccessTokenService _accessTokenService;
        private readonly ILogger _logger;

        public class NrpsClientFactory
        {
            private readonly IHttpClientFactory _clientFactory;
            private readonly IAccessTokenService _accessTokenService;
            private readonly ILogger<NrpsClient> _logger;

            public NrpsClientFactory(IHttpClientFactory clientFactory, IAccessTokenService accessTokenService, ILogger<NrpsClient> logger)
            {
                _clientFactory = clientFactory;
                _accessTokenService = accessTokenService;
                _logger = logger;
            }

            internal NrpsClient Create(string keyVaultKeyString) => new NrpsClient(keyVaultKeyString, _clientFactory, _accessTokenService, _logger);
        }

        private NrpsClient(string keyVaultKeyString, IHttpClientFactory httpClientFactory, IAccessTokenService accessTokenService, ILogger logger)
        {
            _keyVaultKeyString = keyVaultKeyString;
            _httpClientFactory = httpClientFactory;
            _accessTokenService = accessTokenService;
            _logger = logger;
        }
        
        public async Task<IEnumerable<Member>> Get(string clientId, string tokenUrl, string membershipUrl)
        {
            _logger.LogInformation("Getting token for client ID: " + clientId);

            TokenResponse accessTokenResponse = await _accessTokenService.GetAccessTokenAsync(clientId, tokenUrl, Constants.LtiScopes.Nrps.MembershipReadonly, _keyVaultKeyString);
            if (accessTokenResponse.IsError)
            {
                _logger.LogError($"Could not get access token. Error: {accessTokenResponse.Error}. Error Desc: {accessTokenResponse.ErrorDescription}. Type: {accessTokenResponse.ErrorType}");
                throw accessTokenResponse.Exception ?? new Exception($"Internal exception in the authentication flow to LMS: {accessTokenResponse.Error}");
            }

            var httpClient = _httpClientFactory.CreateClient(EdnaExternalHttpHandler.Name);
            httpClient.SetBearerToken(accessTokenResponse.AccessToken);

            httpClient.DefaultRequestHeaders.Accept.Clear();
            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue(Constants.MediaTypes.MembershipContainer));

            _logger.LogInformation("Getting members.");
            using var response = await httpClient.GetAsync(membershipUrl);
            _logger.LogInformation(await response.Content.ReadAsStringAsync());
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Could not get members.");
                throw new Exception(response.ReasonPhrase);
            }

            var content = await response.Content.ReadAsStringAsync();
            var membership = JsonConvert.DeserializeObject<MembershipContainer>(content);
            
            return membership.Members
                .OrderBy(m => m.FamilyName)
                .ThenBy(m => m.GivenName);
        }

        public async Task<Member> GetByEmail(string clientId, string tokenUrl, string membershipUrl, IEnumerable<string> userEmails)
        {
            // Looks like LTI 1.3 doesn't support querying by member identifiers
            IEnumerable<Member> allMembers = await Get(clientId, tokenUrl, membershipUrl);
            int count = 0;
            foreach (Member m in allMembers) {
                count ++;       
                string name = m.Email;
                if (m.Email != null)
                {            
                    int index = name.IndexOf("@");
                    name = name.Substring(0, index);
                    m.FamilyName = name;
                    m.GivenName = " ";
                }
                _logger.LogInformation("No." + count + " Member name = " + m.FamilyName);
                _logger.LogInformation("No." + count + " Member UserId = " + m.UserId);
                _logger.LogInformation("No." + count + " Member Email = " + m.Email);
                _logger.LogInformation("********************");
            }
            
            return allMembers.FirstOrDefault(member => userEmails.Any(userEmail => (member.Email??String.Empty).Equals(userEmail, StringComparison.OrdinalIgnoreCase)));
        }

        public async Task<Member> GetById(string clientId, string tokenUrl, string membershipUrl, string userId)
        {
            // Looks like LTI 1.3 doesn't support querying by member identifiers
            IEnumerable<Member> allMembers = await Get(clientId, tokenUrl, membershipUrl);

            return allMembers.FirstOrDefault(member => member.UserId.Equals(userId));
        }
    }
}
