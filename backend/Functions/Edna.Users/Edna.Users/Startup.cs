// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using System;
using AutoMapper;
using Edna.Bindings.Assignment;
using Edna.Bindings.Lti1;
using Edna.Bindings.LtiAdvantage;
using Edna.Bindings.Platform;
using Edna.Users;
using Microsoft.Azure.Functions.Extensions.DependencyInjection;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;

[assembly: FunctionsStartup(typeof(Startup))]
namespace Edna.Users
{
    public class Startup: IWebJobsStartup
    {
        public void Configure(IWebJobsBuilder builder)
        {
            builder.Services.AddLogging();

            builder.AddAssignmentBinding();
            builder.AddPlatformBinding();
            builder.AddLtiAdvantageBindings();
            builder.AddLti1Binding();

            builder.Services.AddAutoMapper(GetType().Assembly);
            
            builder.Services.AddSingleton((s) => new ConfigurationManager<OpenIdConnectConfiguration>(
                Environment.GetEnvironmentVariable("ADConfigurationUrl"), new OpenIdConnectConfigurationRetriever())
            {
                AutomaticRefreshInterval = TimeSpan.MaxValue
            });
            
            if (Environment.GetEnvironmentVariable("B2CConfigurationUrl") != null) 
                builder.Services.AddSingleton((s) => new ConfigurationManager<OpenIdConnectConfiguration>(
                    Environment.GetEnvironmentVariable("B2CConfigurationUrl"), new OpenIdConnectConfigurationRetriever())
                {
                    AutomaticRefreshInterval = TimeSpan.MaxValue
                });
        }
    }
}