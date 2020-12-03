// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using System;

namespace Edna.AssignmentLinks
{
    public class AssignmentLinkDto
    {
        public Guid Id { get; set; }
        public string DisplayText { get; set; }
        public string Url { get; set; }
        public string Description { get; set; }
    }
}