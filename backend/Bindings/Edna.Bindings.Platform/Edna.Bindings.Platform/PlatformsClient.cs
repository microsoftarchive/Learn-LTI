using System;
using System.Net.Http;
using System.Threading.Tasks;
using Edna.Utils.Http;
using Newtonsoft.Json;

namespace Edna.Bindings.Platform
{
    public class PlatformsClient
    {
        private readonly string _baseServiceUriString;
        private readonly IHttpClientFactory _httpClientFactory;

        internal PlatformsClient(string serviceUrlEnvironmentVariable, IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
            _baseServiceUriString = Environment.GetEnvironmentVariable(serviceUrlEnvironmentVariable);
            if (string.IsNullOrEmpty(_baseServiceUriString))
                throw new ArgumentException("Platform service URL was not provided.");
        }

        public async Task<Models.Platform> GetPlatform(string platformId)
        {
            using HttpClient httpClient = _httpClientFactory.CreateClient(EdnaHttpHandler.Name);
            httpClient.BaseAddress = new Uri(_baseServiceUriString);
            string platformJson = await httpClient.GetStringAsync($"platforms/{platformId}");

            return JsonConvert.DeserializeObject<Models.Platform>(platformJson);
        }
    }
}