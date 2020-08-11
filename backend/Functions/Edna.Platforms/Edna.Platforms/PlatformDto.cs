using IdentityModel.Jwk;

namespace Edna.Platforms
{
    public class PlatformDto
    {
        public string Id { get; set; }
        public string DisplayName { get; set; }
        public string Issuer { get; set; }
        public string JwkSetUrl { get; set; }
        public string AccessTokenUrl { get; set; }
        public string AuthorizationUrl { get; set; }
        public string LoginUrl { get; set; }
        public string LaunchUrl { get; set; }
        public string ClientId { get; set; }
        public string PublicKey { get; set; }
        public string InstitutionName { get; set; }
        public string LogoUrl { get; set; }
        public string ToolJwkSetUrl { get; set; }
        public string ToolJwk{get; set;}


    }
}