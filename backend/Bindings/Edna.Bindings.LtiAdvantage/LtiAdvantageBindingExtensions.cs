
using Edna.Bindings.LtiAdvantage.BindingConfigurations;
using Edna.Bindings.LtiAdvantage.Services;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.DependencyInjection;

namespace Edna.Bindings.LtiAdvantage
{
    public static class LtiAdvantageBindingExtensions
    {
        public static IWebJobsBuilder AddLtiAdvantageBindings(this IWebJobsBuilder builder)
        {
            builder.AddExtension<LtiAdvantageExtensionConfigProvider>();

            builder.Services.AddHttpClient();

            builder.Services.AddSingleton<NrpsClient.NrpsClientFactory>();
            builder.Services.AddSingleton<IAccessTokenService, AccessTokenService>();
            builder.Services.AddSingleton<IKeyVaultPemKeyProvider, KeyVaultPemKeyProvider>();

            return builder;
        }
    }
}
