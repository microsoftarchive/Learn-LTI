// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using System;

namespace Edna.Platforms
{
    public class Profile : AutoMapper.Profile
    {
        private static readonly string ConnectApiBaseUrl = Environment.GetEnvironmentVariable("ConnectApiBaseUrl").TrimEnd('/');

        public Profile()
        {
            CreateMap<PlatformEntity, PlatformDto>()
                .ForMember(dto => dto.LoginUrl, expression => expression.MapFrom(entity => $"{ConnectApiBaseUrl}/oidc-login/{entity.PartitionKey}"))
                .ForMember(dto => dto.LaunchUrl, expression => expression.MapFrom(entity => $"{ConnectApiBaseUrl}/lti-advantage-launch/{entity.PartitionKey}"))
                .ForMember(dto => dto.Id, expression => expression.MapFrom(entity => entity.PartitionKey))
                .ForMember(dto => dto.ToolJwkSetUrl, expression => expression.MapFrom(entity => $"{ConnectApiBaseUrl}/jwks/{entity.PartitionKey}"))
                .ForMember(dto => dto.DomainUrl, expression => expression.MapFrom(entity => new Uri(ConnectApiBaseUrl).Authority))
                .ReverseMap()
                .ForMember(entity => entity.PartitionKey, expression => expression.MapFrom(dto => dto.Id))
                .ForMember(entity => entity.RowKey, expression => expression.MapFrom(dto => dto.Id))
                .ForMember(entity => entity.Issuer, expression => expression.MapFrom(dto => dto.Issuer.Trim()))
                .ForMember(entity => entity.JwkSetUrl, expression => expression.MapFrom(dto => dto.JwkSetUrl.Trim()))
                .ForMember(entity => entity.AccessTokenUrl, expression => expression.MapFrom(dto => dto.AccessTokenUrl.Trim()))
                .ForMember(entity => entity.AuthorizationUrl, expression => expression.MapFrom(dto => dto.AuthorizationUrl.Trim()))
                .ForMember(entity => entity.ClientId, expression => expression.MapFrom(dto => dto.ClientId.Trim()));
        }
    }
}