// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using Microsoft.Extensions.DependencyInjection;

namespace Edna.Utils.Http
{
    public static class EdnaExternalHttpHandlerExtension
    {
        public static void AddEdnaExternalHttpClientHandler(this Microsoft.Extensions.DependencyInjection.IServiceCollection services)
        {
            services.AddHttpClient(nameof(EdnaExternalHttpHandler)).ConfigurePrimaryHttpMessageHandler(() => new EdnaExternalHttpHandler());
        }
    }
}
