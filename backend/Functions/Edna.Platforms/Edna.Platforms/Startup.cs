// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using System;
using AutoMapper;
using Edna.Bindings.LtiAdvantage;
using Edna.Platforms;
using Microsoft.Azure.Functions.Extensions.DependencyInjection;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;

[assembly: FunctionsStartup(typeof(Startup))]

namespace Edna.Platforms
{
    public class Startup : IWebJobsStartup
    {
        public void Configure(IWebJobsBuilder builder)
        {
            builder.Services.AddLogging();

            builder.Services.AddAutoMapper(GetType().Assembly);

            builder.AddLtiAdvantageBindings();
            
            builder.Services.AddSingleton((s) => new ConfigurationManager<OpenIdConnectConfiguration>(
                Environment.GetEnvironmentVariable("ADConfigurationUrl"), new OpenIdConnectConfigurationRetriever()));
            
            builder.Services.AddSingleton((s) => new ConfigurationManager<OpenIdConnectConfiguration>(
                Environment.GetEnvironmentVariable("B2CConfigurationUrl"), new OpenIdConnectConfigurationRetriever()));
        }
    }
}