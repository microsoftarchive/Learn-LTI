using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.DependencyInjection;

namespace Edna.Bindings.Lti1
{
    public static class Lti1BindingExtensions
    {
        public static IWebJobsBuilder AddLti1Binding(this IWebJobsBuilder builder)
        {
            builder.AddExtension<Lti1BindingConfigProvider>();
            builder.Services.AddHttpClient();

            builder.Services.AddSingleton<Lti1MembershipClient>();

            return builder;
        }
    }
}