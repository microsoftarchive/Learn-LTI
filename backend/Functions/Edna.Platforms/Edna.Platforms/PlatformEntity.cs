// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using Microsoft.WindowsAzure.Storage.Table;

namespace Edna.Platforms
{
    public class PlatformEntity : TableEntity
    {
        public string DisplayName { get; set; }
        public string Issuer { get; set; }
        public string JwkSetUrl { get; set; }
        public string AccessTokenUrl { get; set; }
        public string AuthorizationUrl { get; set; }
        public string ClientId { get; set; }
        public string InstitutionName { get; set; }
        public string LogoUrl { get; set; }
    }
}