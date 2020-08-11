using Newtonsoft.Json;

namespace LtiAdvantage.Lti
{
    /// <summary>
    /// Properties associated with the platform initiating the launch.
    /// </summary>
    public class PlatformClaimValueType
    {
        /// <summary>
        /// An email contact for the platform.
        /// </summary>
        [JsonProperty("contact_email")]
        public string ContactEmail { get; set; }

        /// <summary>
        /// This is a plain text user friendly field which describes the platform.
        /// </summary>
        [JsonProperty("description")]
        public string Description { get; set; }

        /// <summary>
        /// This is a unique identifier for the platform (not the software the platform uses).
        /// By common practice, this MAY be the domain of the institution hosting the platform
        /// or the subdomain of the platform instance within the institution's overall domain
        /// (especially if the institution has multiple platforms within its domain).
        /// </summary>
        [JsonProperty("guid")]
        public string Guid { get; set; }

        /// <summary>
        /// This is a plain text user visible field to identify the platform.
        /// </summary>
        [JsonProperty("name")]
        public string Name { get; set; }

        /// <summary>
        /// A code to identify the tool platform's software.
        /// </summary>
        [JsonProperty("product_family_code")]
        public string ProductFamilyCode { get; set; }

        /// <summary>
        /// Common home HTTPS URL for the platform instance.
        /// </summary>
        [JsonProperty("url")]
        public string Url { get; set; }

        /// <summary>
        /// The version of the software the platform is currently running on.
        /// </summary>
        [JsonProperty("version")]
        public string Version { get; set; }
    }
}
