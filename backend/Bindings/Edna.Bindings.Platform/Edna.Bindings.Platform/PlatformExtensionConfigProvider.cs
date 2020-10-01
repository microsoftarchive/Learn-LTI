// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using System.Net.Http;
using System.Threading.Tasks;
using Edna.Bindings.Platform.Attributes;
using Microsoft.Azure.WebJobs.Host.Bindings;
using Microsoft.Azure.WebJobs.Host.Config;

namespace Edna.Bindings.Platform
{
    public class PlatformExtensionConfigProvider : IExtensionConfigProvider
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public PlatformExtensionConfigProvider(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        public void Initialize(ExtensionConfigContext context)
        {
            var platformBindingRule = context.AddBindingRule<PlatformAttribute>();
            
            platformBindingRule.BindToInput(GetPlatform);
            platformBindingRule.BindToInput(attribute => new PlatformsClient(attribute.ServiceUrlEnvironmentVariable, _httpClientFactory));
        }

        private async Task<Models.Platform> GetPlatform(PlatformAttribute platformAttribute, ValueBindingContext context)
        {
            PlatformsClient platformsClient = new PlatformsClient(platformAttribute.ServiceUrlEnvironmentVariable, _httpClientFactory);
            return await platformsClient.GetPlatform(platformAttribute.PlatformId);
        }
    }
}