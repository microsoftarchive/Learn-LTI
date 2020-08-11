namespace LtiAdvantage.AssignmentGradeServices
{
    /// <summary>
    /// Represents a GetLineItems request.
    /// </summary>
    public class GetLineItemsRequest
    {
        /// <summary>
        /// Initialize a new instance of the class.
        /// </summary>
        public GetLineItemsRequest(string contextId, string resourceLinkId, string resourceId, string tag, int? limit)
        {
            ContextId = contextId;
            Limit = limit;
            ResourceLinkId = resourceLinkId;
            ResourceId = resourceId;
            Tag = tag;
        }

        /// <summary>
        /// Get or set the context id.
        /// </summary>
        public string ContextId { get; set; }

        /// <summary>
        /// Get or set the limit filter.
        /// </summary>
        public int? Limit { get; }

        /// <summary>
        /// Get or set the resource link id filter.
        /// </summary>
        public string ResourceLinkId { get; set; }

        /// <summary>
        /// Get or set the resource id filter.
        /// </summary>
        public string ResourceId { get; set; }

        /// <summary>
        /// Get or set the tag filter.
        /// </summary>
        public string Tag { get; set; }
    }
}
