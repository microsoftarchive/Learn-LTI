// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

namespace Edna.Bindings.Platform.Models
{
    public class Platform
    {
        public string Id { get; set; }
        public string DisplayName { get; set; }
        public string Issuer { get; set; }
        public string JwkSetUrl { get; set; }
        public string AccessTokenUrl { get; set; }
        public string AuthorizationUrl { get; set; }
        public string LoginUrl { get; set; }
        public string LaunchUrl { get; set; }
        public string ClientId { get; set; }
        public string PublicKey { get; set; }
        public string InstitutionName { get; set; }
        public string LogoUrl { get; set; }
    }
}