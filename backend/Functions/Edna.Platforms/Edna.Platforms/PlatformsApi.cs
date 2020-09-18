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
using Microsoft.WindowsAzure.Storage.Table;
using System.Text;
using System.Security.Cryptography;
using Newtonsoft.Json;

namespace Edna.Platforms
{
    public class PlatformsApi
    {
        private const string PlatformsTableName = "Platforms";

        private static readonly string[] PossibleEmailClaimTypes = { "email", "upn", "unique_name" };
        private static readonly string ConnectApiBaseUrl = Environment.GetEnvironmentVariable("ConnectApiBaseUrl").TrimEnd('/');
        private static readonly string[] AllowedUsers = Environment.GetEnvironmentVariable("AllowedUsers")?.Split(";") ?? new string[0];

        private readonly IMapper _mapper;
        private readonly ILogger<PlatformsApi> _logger;

        public PlatformsApi(IMapper mapper, ILogger<PlatformsApi> logger)
        {
            _mapper = mapper;
            _logger = logger;
        }

        [FunctionName(nameof(GetAllRegisteredPlatforms))]
        public async Task<IActionResult> GetAllRegisteredPlatforms(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "platforms")] HttpRequest req,
            [LtiAdvantage] LtiToolPublicKey publicKey,
            [Table(PlatformsTableName)] CloudTable table)
        {
            if (!ValidatePermission(req))
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
        public IActionResult GetPlatform(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "platforms/{platformId}")] HttpRequest req,
            [LtiAdvantage] LtiToolPublicKey publicKey,
            [Table(PlatformsTableName, "{platformId}", "{platformId}")] PlatformEntity platformEntity)
        {
            if (!ValidatePermission(req))
                return new UnauthorizedResult();

            PlatformDto platformDto = _mapper.Map<PlatformDto>(platformEntity);
            platformDto.PublicKey = publicKey.PemString;
            platformDto.ToolJwk = JsonConvert.SerializeObject(publicKey.Jwk);

            return new OkObjectResult(platformDto);
        }

        [FunctionName(nameof(GetNewPlatform))]
        public IActionResult GetNewPlatform(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "new-platform")] HttpRequest req,
            [LtiAdvantage] LtiToolPublicKey publicKey)
        {
            if (!ValidatePermission(req))
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
            if (!ValidatePermission(req))
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

        private bool ValidatePermission(HttpRequest req)
        {
            #if DEBUG
            // For debug purposes, there is no authentication.
            return true;
            #endif

            if (!req.Headers.TryGetTokenClaims(out Claim[] claims, message => _logger.LogError(message)))
                return false;

            // By checking appidacr claim, we can know if the call was made by a user or by the system.
            // https://docs.microsoft.com/en-us/azure/active-directory/develop/access-tokens
            string appidacr = claims.FirstOrDefault(claim => claim.Type == "appidacr")?.Value;
            if (appidacr == "2")
                return true;

            if (appidacr == "0")
            {
                if (!TryGetUserEmails(claims, out List<string> userEmails))
                {
                    _logger.LogError("Could not get any user email / uid for the current user.");
                    return false;
                }

                return AllowedUsers.Intersect(userEmails).Any();
            }

            return false;
        }

        private bool TryGetUserEmails(IEnumerable<Claim> claims, out List<string> userEmails)
        {
            userEmails = new List<string>();
            if (claims == null)
                return false;

            Claim[] claimsArray = claims.ToArray();

            userEmails = PossibleEmailClaimTypes
                .Select(claimType => claimsArray.FirstOrDefault(claim => claim.Type == claimType))
                .Where(claim => claim != null)
                .Select(claim => claim.Value)
                .Distinct()
                .ToList();

            return userEmails.Any();
        }

        private string GeneratePlatformID()
        {
            StringBuilder platformID = new StringBuilder();
            using (var hash = SHA256.Create())
            {
                Encoding enc = Encoding.UTF8;
                string allowedUsers = Environment.GetEnvironmentVariable("AllowedUsers");
                Byte[] result = hash.ComputeHash(enc.GetBytes(allowedUsers??String.Empty));

                foreach (Byte b in result)
                    platformID.Append(b.ToString("x2"));
            }
            return platformID.ToString().Substring(0,8);

        }
    }
}