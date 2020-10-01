// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

namespace Edna.AssignmentLinks
{
    public class Profile : AutoMapper.Profile
    {
        public Profile()
        {
            CreateMap<AssignmentLinkDto, AssignmentLinkEntity>()
                .ForMember(entity => entity.RowKey, expression => expression.MapFrom(dto => dto.Id))
                .ReverseMap();
        }
    }
}