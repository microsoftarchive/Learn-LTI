// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using System;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Description;

namespace Edna.Bindings.LtiAdvantage.Attributes
{
    [Binding]
    [AttributeUsage(AttributeTargets.Parameter)]
    [ConnectionProvider(typeof(StorageAccountAttribute))]
    public class LtiAdvantageAttribute : Attribute
    {
        public string Connection { get; set; }

        [AutoResolve]
        public string KeyVaultKeyIdentifier { get; set; } = "%EdnaKeyString%";
    }
}