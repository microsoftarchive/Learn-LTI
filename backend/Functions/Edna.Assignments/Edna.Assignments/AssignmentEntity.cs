// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using System;
using Microsoft.Azure.Cosmos.Table;

namespace Edna.Assignments
{
    public class AssignmentEntity : TableEntity
    {
        public string Name { get; set; }
        public DateTime? Deadline { get; set; }
        public string Description { get; set; }
        public string CourseName { get; set; }
        public string LtiVersion { get; set; }
        public string ContextMembershipsUrl { get; set; }
        public string OAuthConsumerKey { get; set; }
        public string PublishStatus { get; set; }
        public string PlatformId { get; set; }
    }
}