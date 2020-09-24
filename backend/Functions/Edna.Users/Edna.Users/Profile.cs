// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using System;
using System.Collections.Generic;
using System.Linq;
using LtiAdvantage.Lti;
using LtiAdvantage.NamesRoleProvisioningService;
using LtiLibrary.NetCore.Lis.v1;
using LtiLibrary.NetCore.Lis.v2;

namespace Edna.Users
{
    public class Profile : AutoMapper.Profile
    {
        private const string Learner = "learner";
        private const string Teacher = "teacher";

        public Profile()
        {
            CreateMap<Member, MemberDto>()
                .ForMember(dto => dto.Role, expression => expression.MapFrom(member => LtiAdvantageRolesToString(member.Roles)));

            CreateMap<Membership, MemberDto>()
                .ForMember(dto => dto.GivenName, expression => expression.MapFrom(membership => membership.Member.Name.Split(' ', 2, StringSplitOptions.None)[0]))
                .ForMember(dto => dto.FamilyName, expression => expression.MapFrom(membership => membership.Member.Name.Split(' ', 2, StringSplitOptions.None)[1]))
                .ForMember(dto => dto.Email, expression => expression.MapFrom(membership => membership.Member.Email))
                .ForMember(dto => dto.Role, expression => expression.MapFrom(membership => Lti1MembershipRolesToString(membership.Role)));
        }

        private string LtiAdvantageRolesToString(Role[] roles)
        {
            if (roles.Length == 0)
                return string.Empty;

            if (roles.Contains(Role.ContextInstructor) || roles.Contains(Role.InstitutionInstructor))
                return Teacher;

            if (roles.Contains(Role.ContextLearner) || roles.Contains(Role.InstitutionLearner))
                return Learner;

            return string.Empty;
        }

        private string Lti1MembershipRolesToString(ContextRole[] roles)
        {
            if (roles.Length == 0)
                return string.Empty;

            string[] roleStrings = roles.Select(role => role.ToString().ToLower()).ToArray();
            if (roleStrings.Any(roleAsString => roleAsString.Contains("instructor")))
                return Teacher;

            if (roleStrings.Any(roleAsString => roleAsString.Contains("learner")))
                return Learner;

            return string.Empty;
        }
    }
}