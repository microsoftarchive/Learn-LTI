﻿// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

// TODO - file handled names and roles provisioning services client; maybe needs updating for b2c??

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
using System.Text.RegularExpressions;

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
        private const string nrpsNextLinkHeaderSubstring = "\"next\"";
        private static Regex nrpsLinkHeaderRegex = new Regex("(?<=<)(.*?)(?=>;)");

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

        public async Task<IEnumerable<Member>> Get(string clientId, string tokenUrl, string audience, string membershipUrl)
        {
            _logger.LogInformation("Getting token for client ID: " + clientId);

            TokenResponse accessTokenResponse = await _accessTokenService.GetAccessTokenAsync(clientId, tokenUrl, audience, Constants.LtiScopes.Nrps.MembershipReadonly, _keyVaultKeyString);
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
            List<Member> members = new List<Member>();

            do
            {
                using var response = await httpClient.GetAsync(membershipUrl);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("Could not get members.");
                    throw new Exception(response.ReasonPhrase);
                }

                var content = await response.Content.ReadAsStringAsync();
                var membership = JsonConvert.DeserializeObject<MembershipContainer>(content);
                members.AddRange(membership.Members);

                membershipUrl = GetNextMembershipUrlFromHeaders(response.Headers);
            }
            while (!string.IsNullOrEmpty(membershipUrl));

            return members
                .OrderBy(m => m.FamilyName)
                .ThenBy(m => m.GivenName);
        }

        public async Task<Member> GetByEmail(string clientId, string tokenUrl, string audience, string membershipUrl, IEnumerable<string> userEmails)
        {
            // Looks like LTI 1.3 doesn't support querying by member identifiers

            IEnumerable<Member> allMembers = await Get(clientId, tokenUrl, audience, membershipUrl);
            foreach (Member m in allMembers)
            {
                string name = m.Email;
                if (m.Email != null && (m.FamilyName == null || m.GivenName == null))
                {
                    int index = name.IndexOf("@");
                    name = name.Substring(0, index);
                    m.FamilyName = name;
                    m.GivenName = " ";
                }
            }
            return allMembers.FirstOrDefault(member => userEmails.Any(userEmail => (member.Email ?? String.Empty).Equals(userEmail, StringComparison.OrdinalIgnoreCase)));
        }

        public async Task<Member> GetById(string clientId, string tokenUrl, string audience, string membershipUrl, string userId)
        {
            // Looks like LTI 1.3 doesn't support querying by member identifiers
            IEnumerable<Member> allMembers = await Get(clientId, tokenUrl, audience, membershipUrl);

            return allMembers.FirstOrDefault(member => member.UserId.Equals(userId));
        }

        private string GetNextMembershipUrlFromHeaders(HttpResponseHeaders headers)
        {
            string linkUrls = headers.TryGetValues("Link", out var values) ? values.FirstOrDefault() : null;
            if (string.IsNullOrEmpty(linkUrls))
            {
                return null;
            }

            string[] urls = linkUrls.Split(',');
            string nextUrl = urls.FirstOrDefault(u => u.IndexOf(nrpsNextLinkHeaderSubstring, StringComparison.OrdinalIgnoreCase) >=0 );

            if (string.IsNullOrEmpty(nextUrl))
            {
                return null;
            }

            // Regex to get the url from next url excluding < and >; characters.
            try
            {
                Match matchResults = nrpsLinkHeaderRegex.Match(nextUrl);
                if (matchResults.Success)
                {
                    return matchResults.Value;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Failed to match the next-link-header value using regexp, returning null for next-nrps-url; exception: {ex.Message}");
            }

            return null;
        }
    }
}
