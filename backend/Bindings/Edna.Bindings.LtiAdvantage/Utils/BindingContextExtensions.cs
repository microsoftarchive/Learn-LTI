// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using System;
using Microsoft.AspNetCore.Http;
using Microsoft.Azure.WebJobs.Host.Bindings;

namespace Edna.Bindings.LtiAdvantage.Utils
{
    public static class BindingContextExtensions
    {
        public static HttpRequest GetHttpRequest(this BindingContext context)
        {
            if (!context.BindingData.TryGetValue("$request", out object requestObject))
                throw new ArgumentException("The provided context doesn't contain an HTTP request.");

            HttpRequest request = requestObject as HttpRequest;
            if (request is null)
                throw new ArgumentException("The provided context doesn't contain an HTTP request of type HttpRequest.");

            return request;
        }
    }
}