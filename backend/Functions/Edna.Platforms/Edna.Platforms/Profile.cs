using System;

namespace Edna.Platforms
{
    public class Profile : AutoMapper.Profile
    {
        private static readonly string ConnectApiBaseUrl = Environment.GetEnvironmentVariable("ConnectApiBaseUrl");

        public Profile()
        {
            CreateMap<PlatformEntity, PlatformDto>()
                .ForMember(dto => dto.LoginUrl, expression => expression.MapFrom(entity => $"{ConnectApiBaseUrl}/oidc-login/{entity.PartitionKey}"))
                .ForMember(dto => dto.LaunchUrl, expression => expression.MapFrom(entity => $"{ConnectApiBaseUrl}/lti-advantage-launch/{entity.PartitionKey}"))
                .ForMember(dto => dto.Id, expression => expression.MapFrom(entity => entity.PartitionKey))
                .ReverseMap()
                .ForMember(entity => entity.PartitionKey, expression => expression.MapFrom(dto => dto.Id))
                .ForMember(entity => entity.RowKey, expression => expression.MapFrom(dto => dto.Id));
        }
    }
}