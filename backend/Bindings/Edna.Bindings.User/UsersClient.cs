// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using System;
using System.Net.Http;
using System.Threading.Tasks;
using Edna.Utils.Http;
using Newtonsoft.Json;

namespace Edna.Bindings.User
{
    public class UsersClient
    {
        private readonly string _baseServiceUriString;
        private readonly IHttpClientFactory _httpClientFactory;

        internal UsersClient(string serviceUrlEnvironmentVariable, IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
            _baseServiceUriString = Environment.GetEnvironmentVariable(serviceUrlEnvironmentVariable);
            if (string.IsNullOrEmpty(_baseServiceUriString))
                throw new ArgumentException("User service URL was not provided.");
        }

        public async Task<Models.User[]> GetAllUsers(string assignmentId)
        {
            using HttpClient httpClient = _httpClientFactory.CreateClient(EdnaHttpHandler.Name);
            httpClient.BaseAddress = new Uri(_baseServiceUriString);
            string allUsersJson = await httpClient.GetStringAsync($"assignments/{assignmentId}/users");
            
            return JsonConvert.DeserializeObject<Models.User[]>(allUsersJson);
        }
    }
}