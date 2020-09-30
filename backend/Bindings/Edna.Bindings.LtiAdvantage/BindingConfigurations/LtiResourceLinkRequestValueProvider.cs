// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using System;
using System.Threading.Tasks;
using Edna.Bindings.LtiAdvantage.Services;
using LtiAdvantage.Lti;
using Microsoft.AspNetCore.Http;
using Microsoft.Azure.WebJobs.Host.Bindings;

namespace Edna.Bindings.LtiAdvantage.BindingConfigurations
{
    public class LtiResourceLinkRequestValueProvider : IValueProvider
    {
        private readonly HttpRequest _request;

        public LtiResourceLinkRequestValueProvider(HttpRequest request)
        {
            _request = request;
        }

        public Task<object> GetValueAsync() => Task.FromResult<object>(new LtiResourceLinkRequestClient(_request));
        public string ToInvokeString() => "LtiAdvantageRequest";
        public Type Type { get; } = typeof(LtiResourceLinkRequest);
    }
}