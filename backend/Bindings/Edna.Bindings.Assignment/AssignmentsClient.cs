using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Edna.Utils.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace Edna.Bindings.Assignment
{
    public class AssignmentsClient
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<AssignmentsClient> _logger;

        private AssignmentsClient(HttpClient httpClient, ILogger<AssignmentsClient> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public class Factory
        {
            private readonly IHttpClientFactory _httpClientFactory;
            private readonly ILogger<AssignmentsClient> _logger;

            public Factory(IHttpClientFactory httpClientFactory, ILogger<AssignmentsClient> logger)
            {
                _httpClientFactory = httpClientFactory;
                _logger = logger;
            }

            public AssignmentsClient CreateClient(string baseUrl)
            {
                HttpClient httpClient = _httpClientFactory.CreateClient(EdnaHttpHandler.Name);
                httpClient.BaseAddress = new Uri(baseUrl);

                return new AssignmentsClient(httpClient, _logger);
            }
        }

        public async Task<Models.Assignment> GetAssignment(string assignmentId)
        {
            if (string.IsNullOrEmpty(assignmentId))
                throw new ArgumentNullException(nameof(assignmentId));

            string assignmentJson = await _httpClient.GetStringAsync($"assignments/{assignmentId}");
            return JsonConvert.DeserializeObject<Models.Assignment>(assignmentJson);
        }

        public async Task SaveAssignment(Models.Assignment assignment)
        {
            if (assignment == null)
                throw new ArgumentNullException(nameof(assignment));

            HttpResponseMessage assignmentSaveResponse = await _httpClient.PostAsJsonAsync("assignments", assignment);

            if (!assignmentSaveResponse.IsSuccessStatusCode)
            {
                string errorContent = await assignmentSaveResponse.Content.ReadAsStringAsync();
                _logger.LogError($"Could not save assignment. Error: {errorContent}");
            }
            else
            {
                Models.Assignment savedAssignment = await assignmentSaveResponse.Content.ReadAsAsync<Models.Assignment>();
                assignment.Id = savedAssignment.Id;
            }
        }
    }
}