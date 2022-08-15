// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using Edna.Bindings.LtiAdvantage.Attributes;
using Edna.Bindings.LtiAdvantage.Models;
using Edna.Utils.Http;
using Edna.Utils.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Azure.Cosmos.Table;
using System.Text;
using System.Security.Cryptography;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Newtonsoft.Json;

namespace Edna.Platforms
{
    public class PlatformsApi
    {
        private const string PlatformsTableName = "Platforms";

        private static readonly string[] PossibleEmailClaimTypes = { "email", "emails", "upn", "unique_name" };
        private static readonly string ConnectApiBaseUrl = Environment.GetEnvironmentVariable("ConnectApiBaseUrl")?.TrimEnd('/');
        private static readonly string[] AllowedUsers = Environment.GetEnvironmentVariable("AllowedUsers")?.Split(";") ?? new string[0];

        private readonly ConfigurationManager<OpenIdConnectConfiguration> _adManager, _b2CManager;
        private static readonly string ValidAudience = Environment.GetEnvironmentVariable("ValidAudience");

        private readonly IMapper _mapper;
        private readonly ILogger<PlatformsApi> _logger;

        public PlatformsApi(IMapper mapper, ILogger<PlatformsApi> logger, IEnumerable<ConfigurationManager<OpenIdConnectConfiguration>> managers)
        {
            _mapper = mapper;
            _logger = logger;
            
            var configurationManagers = managers.ToList();
            _adManager = configurationManagers.FirstOrDefault(m =>
                m.MetadataAddress == Environment.GetEnvironmentVariable("ADConfigurationUrl"));
            _b2CManager = configurationManagers.FirstOrDefault(m =>
                m.MetadataAddress == Environment.GetEnvironmentVariable("B2CConfigurationUrl"));
        }

        [FunctionName(nameof(GetAllRegisteredPlatforms))]
        public async Task<IActionResult> GetAllRegisteredPlatforms(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "platforms")] HttpRequest req,
            [LtiAdvantage] LtiToolPublicKey publicKey,
            [Table(PlatformsTableName)] CloudTable table)
        {
            if (!await ValidatePermission(req))
                return new UnauthorizedResult();

            _logger.LogInformation("Getting all the registered platforms.");

            List<PlatformDto> platforms = new List<PlatformDto>();

            TableQuery<PlatformEntity> emptyQuery = new TableQuery<PlatformEntity>();
            TableContinuationToken continuationToken = null;
            do
            {
                TableQuerySegment<PlatformEntity> querySegmentResult = await table.ExecuteQuerySegmentedAsync(emptyQuery, continuationToken);
                continuationToken = querySegmentResult.ContinuationToken;

                IEnumerable<PlatformDto> platformDtos = querySegmentResult
                    .Results
                    .Select(_mapper.Map<PlatformDto>)
                    .Do(dto => {
                        dto.PublicKey = publicKey.PemString;
                        dto.ToolJwk = JsonConvert.SerializeObject(publicKey.Jwk);
                    });

                platforms.AddRange(platformDtos);
            } while (continuationToken != null);

            return new OkObjectResult(platforms);
        }

        [FunctionName(nameof(GetPlatform))]
        public async Task<IActionResult> GetPlatform(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "platforms/{platformId}")] HttpRequest req,
            [LtiAdvantage] LtiToolPublicKey publicKey,
            [Table(PlatformsTableName, "{platformId}", "{platformId}")] PlatformEntity platformEntity)
        {
            if (!await ValidatePermission(req))
                return new UnauthorizedResult();

            PlatformDto platformDto = _mapper.Map<PlatformDto>(platformEntity);
            platformDto.PublicKey = publicKey.PemString;
            platformDto.ToolJwk = JsonConvert.SerializeObject(publicKey.Jwk);

            return new OkObjectResult(platformDto);
        }

        [FunctionName(nameof(GetNewPlatform))]
        public async Task<IActionResult> GetNewPlatform(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "new-platform")] HttpRequest req,
            [LtiAdvantage] LtiToolPublicKey publicKey)
        {
            if (!await ValidatePermission(req))
                return new UnauthorizedResult();

            string platformId = GeneratePlatformID();

            PlatformDto platformDto = new PlatformDto
            {
                Id = platformId,
                LoginUrl = $"{ConnectApiBaseUrl}/oidc-login/{platformId}",
                LaunchUrl = $"{ConnectApiBaseUrl}/lti-advantage-launch/{platformId}",
                PublicKey = publicKey.PemString,

                ToolJwk = JsonConvert.SerializeObject(publicKey.Jwk),
                ToolJwkSetUrl = $"{ConnectApiBaseUrl}/jwks/{platformId}",
                DomainUrl = new Uri(ConnectApiBaseUrl).Authority
            };

            return new OkObjectResult(platformDto);
        }

        [FunctionName(nameof(CreateOrUpdatePlatform))]
        public async Task<IActionResult> CreateOrUpdatePlatform(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "platforms")] HttpRequest req,
            [Table(PlatformsTableName)] IAsyncCollector<PlatformEntity> entityCollector)
        {
            if (!await ValidatePermission(req))
                return new UnauthorizedResult();

            string platformDtoJson = await req.ReadAsStringAsync();
            PlatformDto platformDto = JsonConvert.DeserializeObject<PlatformDto>(platformDtoJson);

            PlatformEntity platformEntity = _mapper.Map<PlatformEntity>(platformDto);
            platformEntity.ETag = "*";

            await entityCollector.AddAsync(platformEntity);
            await entityCollector.FlushAsync();

            string platformGetUrl = $"{req.Scheme}://{req.Host}/api/platforms/{platformEntity.PartitionKey}";
            PlatformDto updatedPlatformDto = _mapper.Map<PlatformDto>(platformEntity);

            return new CreatedResult(platformGetUrl, updatedPlatformDto);
        }

        private async Task<bool> ValidatePermission(HttpRequest req)
        {
            #if DEBUG
            // For debug purposes, there is no authentication.
            return true;
            #endif

            if (!await req.Headers.ValidateToken(_adManager, _b2CManager, ValidAudience, message => _logger.LogError(message)))
                return false;
            
            bool isSystemCallOrUserWithValidEmail = req.Headers.TryGetUserEmails(out List<string> userEmails);
            if (isSystemCallOrUserWithValidEmail)
                return userEmails.Count <= 0 || AllowedUsers.Intersect(userEmails).Any();
            _logger.LogError("Could not get user email.");
            return false;
        }

        private string GeneratePlatformID()
        {
            StringBuilder platformID = new StringBuilder();
            using (var hash = SHA256.Create())
            {
                Encoding enc = Encoding.UTF8;
                string allowedUsers = Environment.GetEnvironmentVariable("AllowedUsers");
                Byte[] result = hash.ComputeHash(enc.GetBytes(allowedUsers ?? String.Empty));

                foreach (Byte b in result)
                    platformID.Append(b.ToString("x2"));
            }
            return platformID.ToString().Substring(0, 8);

        }
    }
}