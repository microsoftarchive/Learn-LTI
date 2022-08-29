// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using Microsoft.Azure.Cosmos.Table;
using System.ComponentModel.DataAnnotations;

namespace Edna.AssignmentLinks
{
    public class AssignmentLinkEntity : TableEntity
    {
        [StringLength(500)]
        public string DisplayText { get; set; }

        [Url]
        [Required]
        public string Url { get; set; }

        [StringLength(1000)]
        public string Description { get; set; }
    }
}