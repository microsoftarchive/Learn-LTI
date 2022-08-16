// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using System;
using AutoMapper;
using Edna.AssignmentLearnContent;
using Microsoft.Azure.Functions.Extensions.DependencyInjection;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Edna.Bindings.User;
using Edna.Utils.Http;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;

[assembly: FunctionsStartup(typeof(Startup))]

namespace Edna.AssignmentLearnContent
{
    public class Startup : IWebJobsStartup
    {
        public void Configure(IWebJobsBuilder builder)
        {
            builder.Services.AddLogging();

            builder.AddUserBinding();

            builder.Services.AddEdnaExternalHttpClientHandler();

            builder.Services.AddAutoMapper(GetType().Assembly);
            
            builder.Services.AddSingleton((s) => new ConfigurationManager<OpenIdConnectConfiguration>(
                Environment.GetEnvironmentVariable("ADConfigurationUrl"), new OpenIdConnectConfigurationRetriever()));
            
            if (Environment.GetEnvironmentVariable("B2CConfigurationUrl") != null)
                builder.Services.AddSingleton((s) => new ConfigurationManager<OpenIdConnectConfiguration>(
                    Environment.GetEnvironmentVariable("B2CConfigurationUrl"), new OpenIdConnectConfigurationRetriever()));
        }
    }
}