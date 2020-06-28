using System;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Azure.Services.AppAuthentication;

namespace Edna.Utils.Http
{
    public class EdnaHttpHandler : HttpClientHandler
    {
        private static readonly AzureServiceTokenProvider TokenProvider = new AzureServiceTokenProvider();
        private static readonly string AppUrl = Environment.GetEnvironmentVariable("AuthUrl");

        public static string Name = nameof(EdnaHttpHandler);
        
        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            // In local debugging, it is easier to ignore the auth all together.
            #if !DEBUG

            string accessToken = await TokenProvider.GetAccessTokenAsync(AppUrl, cancellationToken: cancellationToken);

            request.Headers.Add("Authorization", "Bearer " + accessToken);

            #endif

            return await base.SendAsync(request, cancellationToken);
        }
    }
}