using Newtonsoft.Json;

namespace LtiAdvantage.NamesRoleProvisioningService
{
    /// <summary>
    /// LTI claim to include in the LtiResourceLinkRequest if the platform
    /// supports the Names and Role Service.
    /// </summary>
    public class NamesRoleServiceClaimValueType
    {
        /// <summary>
        /// </summary>
        public NamesRoleServiceClaimValueType()
        {
            ServiceVersions = new[] {Version};
        }

        /// <summary>
        /// The version of this implementation.
        /// </summary>
        public const string Version = "2.0";

        /// <summary>
        /// Fully resolved URL to service.
        /// </summary>
        [JsonProperty("context_memberships_url")]
        public string ContextMembershipUrl { get; set; }

        /// <summary>
        /// Service version. Default is <see cref="Version"/>.
        /// </summary>
        [JsonProperty("service_versions")]
        public string[] ServiceVersions { get; set; }
    }
}
