using Edna.Utils.Http;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.DependencyInjection;

namespace Edna.Bindings.Platform
{
    public static class PlatformBindingExtensions
    {
        public static IWebJobsBuilder AddPlatformBinding(this IWebJobsBuilder builder)
        {
            builder.AddExtension<PlatformExtensionConfigProvider>();

            builder.Services.AddHttpClient();
            builder.Services.AddHttpClient(EdnaHttpHandler.Name).ConfigurePrimaryHttpMessageHandler(() => new EdnaHttpHandler());

            return builder;
        }
    }
}