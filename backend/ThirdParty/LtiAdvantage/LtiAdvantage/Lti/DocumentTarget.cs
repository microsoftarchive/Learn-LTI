using Newtonsoft.Json;

namespace LtiAdvantage.Lti
{
    /// <summary>
    /// Represents launch_presentation document_target values.
    /// </summary>
    [JsonConverter(typeof(DocumentTargetConverter))]
    public enum DocumentTarget
    {
        /// <summary>
        /// </summary>
        None = 0,

        /// <summary>
        /// The Tool is being launched within an iframe placed inside the same browser page/frame
        /// as the resource link.
        /// </summary>
        Iframe,

        /// <summary>
        /// The Tool is being launched within a new browser window or tab.
        /// </summary>
        Window
    }
}

