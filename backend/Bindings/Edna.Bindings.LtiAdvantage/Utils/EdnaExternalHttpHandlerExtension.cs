using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;

namespace Edna.Bindings.LtiAdvantage.Utils
{
    public static class EdnaExternalHttpHandlerExtension
    {
        public static void AddEdnaExternalHttpClientHandler(this IServiceCollection services)
        {
            services.AddHttpClient(nameof(EdnaExternalHttpHandler)).ConfigurePrimaryHttpMessageHandler(() => new EdnaExternalHttpHandler());
        }
    }
}
