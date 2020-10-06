using Edna.Utils.Http;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.DependencyInjection;

namespace Edna.Bindings.User
{
    public static class UserBindingExtensions
    {
        public static IWebJobsBuilder AddUserBinding(this IWebJobsBuilder builder)
        {
            builder.AddExtension<UserExtensionConfigProvider>();

            builder.Services.AddHttpClient();
            builder.Services.AddHttpClient(EdnaHttpHandler.Name).ConfigurePrimaryHttpMessageHandler(() => new EdnaHttpHandler());

            return builder;

        }
    }
}