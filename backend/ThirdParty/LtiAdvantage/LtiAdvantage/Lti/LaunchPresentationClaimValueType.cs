using Newtonsoft.Json;

namespace LtiAdvantage.Lti
{
    /// <summary>
    /// Information to help the Tool present itself appropriately.
    /// </summary>
    public class LaunchPresentationClaimValueType
    {
        /// <summary>
        /// The type of 'browsing context' the launch occurred in. See
        /// https://www.w3.org/TR/html51/browsers.html#sec-browsing-contexts.
        /// </summary>
        [JsonProperty("document_target")]
        public DocumentTarget? DocumentTarget { get; set; }

        /// <summary>
        /// The height in pixels of the window or frame where the content from the tool
        /// will be displayed.
        /// </summary>
        [JsonProperty("height")]
        public int? Height { get; set; }
        
        /// <summary>
        /// End-User's locale, represented as a BCP47 [RFC5646] language tag. This is typically an
        /// ISO 639-1 Alpha-2 [ISO639‑1] language code in lowercase and an ISO 3166-1 Alpha-2 [ISO3166‑1]
        /// country code in uppercase, separated by a dash. For example, en-US or fr-CA. As a compatibility
        /// note, some implementations have used an underscore as the separator rather than a dash, for
        /// example, en_US; Tools MAY choose to accept this locale syntax as well.
        /// <example>
        /// en-US
        /// </example>
        /// </summary>
        [JsonProperty("locale")]
        public string Locale { get; set; }

        /// <summary>
        /// Fully qualified URL within the tool platform interface to which the tool can
        /// redirect the user when it's done. An lti_log or lti_errormsg parameter may be
        /// added as a query parameter.
        /// </summary>
        [JsonProperty("return_url")]
        public string ReturnUrl { get; set; }

        /// <summary>
        /// The width in pixels of the window or frame where the content from the tool
        /// will be displayed.
        /// </summary>
        [JsonProperty("width")]
        public int? Width { get; set; }
    }
}
