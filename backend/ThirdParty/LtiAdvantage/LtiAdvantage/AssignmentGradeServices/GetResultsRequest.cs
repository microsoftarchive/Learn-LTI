namespace LtiAdvantage.AssignmentGradeServices
{
    /// <summary>
    /// Represents a GetResults request.
    /// </summary>
    public class GetResultsRequest
    {
        /// <summary>
        /// Initialize a new instance of the class.
        /// </summary>
        public GetResultsRequest(string contextId, string lineItemId, string userId, int? limit)
        {
            ContextId = contextId;
            LineItemId = lineItemId;
            Limit = limit;
            UserId = userId;
        }

        /// <summary>
        /// Get or set the context_id.
        /// </summary>
        public string ContextId { get;  }
        
        /// <summary>
        /// Get or set the line item Id.
        /// </summary>
        public string LineItemId { get; }
        
        /// <summary>
        /// Get or set the limit filter.
        /// </summary>
        public int? Limit { get; }

        /// <summary>
        /// Get or set the user ID filter.
        /// </summary>
        public string UserId { get; }
    }
}
