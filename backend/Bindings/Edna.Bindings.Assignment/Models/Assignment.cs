// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using System;
using System.ComponentModel.DataAnnotations;

namespace Edna.Bindings.Assignment.Models
{
    public class Assignment
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

        [EnumDataType(typeof(LtiVersion))]
        public object LtiVersion { get; set; }

        [Url]
        public string ContextMembershipsUrl { get; set; }

        public string OAuthConsumerKey { get; set; }

        public PublishStatus? PublishStatus { get; set; }

        public string PlatformId { get; set; }
    }
}