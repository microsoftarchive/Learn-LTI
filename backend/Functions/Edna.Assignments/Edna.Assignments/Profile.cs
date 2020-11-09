// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using Edna.Bindings.Platform.Models;

namespace Edna.Assignments
{
    public class Profile : AutoMapper.Profile
    {
        public Profile()
        {
            CreateMap<AssignmentDto, AssignmentEntity>()
                .ForMember(entity => entity.PartitionKey, expression => expression.MapFrom(dto => dto.ContextId))
                .ForMember(entity => entity.RowKey, expression => expression.MapFrom(dto => dto.ResourceLinkId))
                .ReverseMap()
                .ForMember(dto => dto.Id, expression => expression.MapFrom(entity => entity.ToAssignmentId()))
                .ForMember(dto => dto.PublishStatus, expression => expression.MapFrom(assignment => string.IsNullOrEmpty(assignment.PublishStatus) ? PublishStatus.NotPublished.ToString() : assignment.PublishStatus));

            CreateMap<Platform, PlatformPersonalizationDto>();
        }
    }
}