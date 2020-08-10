using Newtonsoft.Json;

namespace LtiAdvantage.Lti
{
    /// <summary>
    /// Properties of the context from which the launch originated (for example, course id and title).
    /// </summary>
    public class ContextClaimValueType
    {
        /// <summary>
        /// An opaque identifier that identifies the context where the launch originated. Must be
        /// unique within the scope of the tool_consumer_instance_guid.
        /// </summary>
        [JsonProperty("id", Required = Required.Always)]
        public string Id { get; set; }

        /// <summary>
        /// A plain text label for the context.
        /// </summary>
        [JsonProperty("label")]
        public string Label { get; set; }

        /// <summary>
        /// A plain text title of the context.
        /// </summary>
        [JsonProperty("title")]
        public string Title { get; set; }

        /// <summary>
        /// An array of URI values that identify the type of context. The list MUST include a URN
        /// value drawn from the LIS vocabulary. The assumed namespace of these URNs is the LIS
        /// vocabulary so Tools can use the handles when the intent is to refer to an LIS context
        /// type. If the Platform wants to include a context type from another namespace, a fully
        /// qualified URN should be used.
        /// </summary>
        [JsonProperty("type")]
        public ContextType[] Type { get; set; }
    }
}
