// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using Edna.Utils.Http;
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
            builder.Services.AddHttpClient(EdnaExternalHttpHandler.Name).ConfigurePrimaryHttpMessageHandler(() => new EdnaExternalHttpHandler());
            builder.Services.AddSingleton<Lti1MembershipClient>();

            return builder;
        }
    }
}