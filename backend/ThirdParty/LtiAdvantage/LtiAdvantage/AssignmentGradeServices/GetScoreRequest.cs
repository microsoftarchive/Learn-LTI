namespace LtiAdvantage.AssignmentGradeServices
{
    /// <summary>
    /// Represents a Get Score request.
    /// </summary>
    public class GetScoreRequest
    {
        /// <summary>
        /// Create a GetScoreRequest.
        /// </summary>
        /// <param name="contextId">The context id.</param>
        /// <param name="lineItemId">The line item id.</param>
        /// <param name="scoreId">The score id.</param>
        public GetScoreRequest(string contextId, string lineItemId, string scoreId)
        {
            ContextId = contextId;
            LineItemId = lineItemId;
            ScoreId = scoreId;
        }

        /// <summary>
        /// Get or set the context id.
        /// </summary>
        public string ContextId { get; set; }

        /// <summary>
        /// Get or set the line item id.
        /// </summary>
        public string LineItemId { get; set; }

        /// <summary>
        /// Get or set the score id.
        /// </summary>
        public string ScoreId { get; set; }
    }
}
