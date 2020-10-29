// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using Edna.Bindings.LtiAdvantage.BindingConfigurations;
using Edna.Bindings.LtiAdvantage.Services;
using Edna.Utils.Http;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.DependencyInjection;

namespace Edna.Bindings.LtiAdvantage
{
    public static class LtiAdvantageBindingExtensions
    {
        public static IWebJobsBuilder AddLtiAdvantageBindings(this IWebJobsBuilder builder)
        {
            builder.AddExtension<LtiAdvantageExtensionConfigProvider>();

            builder.Services.AddHttpClient(EdnaExternalHttpHandler.Name).ConfigurePrimaryHttpMessageHandler(() => new EdnaExternalHttpHandler());

            builder.Services.AddSingleton<NrpsClient.NrpsClientFactory>();
            builder.Services.AddSingleton<IAccessTokenService, AccessTokenService>();
            builder.Services.AddSingleton<IKeyVaultPemKeyProvider, KeyVaultPemKeyProvider>();
            builder.Services.AddSingleton<IKeyVaultJwkProvider, KeyVaultJwkProvider>();

            return builder;
        }
    }
}
