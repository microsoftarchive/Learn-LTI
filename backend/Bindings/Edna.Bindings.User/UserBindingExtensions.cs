// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

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