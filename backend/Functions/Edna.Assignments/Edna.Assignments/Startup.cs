// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using System;
using AutoMapper;
using Edna.Assignments;
using Edna.Bindings.Platform;
using Edna.Bindings.User;
using Microsoft.Azure.Functions.Extensions.DependencyInjection;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;

[assembly: FunctionsStartup(typeof(Startup))]
namespace Edna.Assignments
{
    public class Startup : IWebJobsStartup
    {
        public void Configure(IWebJobsBuilder builder)
        {
            builder.Services.AddLogging();
            builder.AddPlatformBinding();
            builder.AddUserBinding();

            builder.Services.AddAutoMapper(GetType().Assembly);
            
            builder.Services.AddSingleton((s) => new ConfigurationManager<OpenIdConnectConfiguration>(
                Environment.GetEnvironmentVariable("ADConfigurationUrl"), new OpenIdConnectConfigurationRetriever()));
            
            if (Environment.GetEnvironmentVariable("B2CConfigurationUrl") != null) 
                builder.Services.AddSingleton((s) => new ConfigurationManager<OpenIdConnectConfiguration>(
                    Environment.GetEnvironmentVariable("B2CConfigurationUrl"), new OpenIdConnectConfigurationRetriever()));
        }
    }
}