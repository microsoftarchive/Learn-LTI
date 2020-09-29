// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using System;
using Microsoft.Azure.WebJobs.Description;

namespace Edna.Bindings.Assignment.Attributes
{
    [Binding]
    [AttributeUsage(AttributeTargets.Parameter)]
    public class AssignmentAttribute : Attribute
    {
        public string ServiceUrlEnvironmentVariable { get; set; } = "AssignmentsServiceUrl";

        [AutoResolve]
        public string AssignmentId { get; set; }
    }
}