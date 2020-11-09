// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using System.Net.Http;
using System.Security.Cryptography.X509Certificates;
using System.Net.Security;
using Microsoft.Extensions.DependencyInjection;

namespace Edna.Bindings.LtiAdvantage.Utils
{
    public class EdnaExternalHttpHandler : HttpClientHandler
    {
        public static string Name = nameof(EdnaExternalHttpHandler);

        public EdnaExternalHttpHandler() : base()
        {
            ServerCertificateCustomValidationCallback = PerformX509Valiation;
        }

        private bool PerformX509Valiation(HttpRequestMessage req, X509Certificate2 cert, X509Chain chain, SslPolicyErrors err)
        {
            return (err == SslPolicyErrors.None) && chain.Build(cert);
        }
    }
}
