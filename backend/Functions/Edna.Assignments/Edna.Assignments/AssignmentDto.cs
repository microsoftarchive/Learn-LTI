// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using System;
using System.ComponentModel.DataAnnotations;

namespace Edna.Assignments
{
    public class AssignmentDto
    {
        public string Id { get; set; }
        public string ContextId { get; set; }
        public string ResourceLinkId { get; set; }

        [StringLength(100)]
        public string Name { get; set; }
        public DateTime? Deadline { get; set; }

        [StringLength(2500)]
        public string Description { get; set; }

        [StringLength(100)]
        public string CourseName { get; set; }
        public string LtiVersion { get; set; }

        [Url]
        public string ContextMembershipsUrl { get; set; }
        public string OAuthConsumerKey { get; set; }

        [EnumDataType(typeof(PublishStatus))]
        public object PublishStatus { get; set; }
        public string PlatformId { get; set; }
        public PlatformPersonalizationDto PlatformPersonalization { get; set; }
    }
}