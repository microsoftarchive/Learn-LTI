using Newtonsoft.Json;

namespace LtiAdvantage.NamesRoleProvisioningService
{
    /// <summary>
    /// The context of a membership container.
    /// </summary>
    public class Context
    {
        /// <summary>
        /// The context id.
        /// </summary>
        [JsonProperty("id")]
        public string Id { get; set; }

        /// <summary>
        /// The context label.
        /// </summary>
        [JsonProperty("label")]
        public string Label { get; set; }


        /// <summary>
        /// The context title.
        /// </summary>
        [JsonProperty("title")]
        public string Title { get; set; }
    }
}
