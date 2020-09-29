// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using Microsoft.WindowsAzure.Storage.Table;

namespace Edna.AssignmentLearnContent
{
    public class Profile : AutoMapper.Profile
    {
        public Profile()
        {
            CreateMap<AssignmentLearnContentDto, AssignmentLearnContentEntity>()
                .ForMember(entity => entity.RowKey, expression => expression.MapFrom(dto => dto.ContentUid))
                .ReverseMap();
        }
    }
}