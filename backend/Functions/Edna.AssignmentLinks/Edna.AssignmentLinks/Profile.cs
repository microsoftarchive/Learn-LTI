// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using System;
using System.Collections.Generic;
using System.Linq;

namespace Edna.AssignmentLinks
{
    public class Profile : AutoMapper.Profile
    {
        public Profile()
        {
            CreateMap<AssignmentLinkDto, AssignmentLinkEntity>()
                .ForMember(entity => entity.RowKey, expression => expression.MapFrom(dto => dto.Id));

            CreateMap<AssignmentLinkEntity, AssignmentLinkDto>()
                .ForMember(dto => dto.Id, opt =>
                {
                    // The precondition maps the link id only if it can be parsed to a Guid
                    // The default value in that case is Guid.Empty
                    // These links with invalid Ids must be handled on the client side 
                    opt.PreCondition(entity => Guid.TryParse(entity.RowKey, out Guid result));
                    opt.MapFrom(entity => entity.RowKey);
                });
        }
    }
}