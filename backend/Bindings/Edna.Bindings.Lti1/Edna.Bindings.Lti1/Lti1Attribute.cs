// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using System;
using Microsoft.Azure.WebJobs.Description;

namespace Edna.Bindings.Lti1
{
    [Binding]
    [AttributeUsage(AttributeTargets.Parameter)]
    public class Lti1Attribute : Attribute
    {
    }
}