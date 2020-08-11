namespace LtiAdvantage.AssignmentGradeServices
{
    /// <summary>
    /// Represents a create score request.
    /// </summary>
    public class AddScoreRequest
    {
        /// <summary>
        /// Initialize a new instance of the class.
        /// </summary>
        public AddScoreRequest(string contextId, string lineItemId, Score score)
        {
            ContextId = contextId;
            LineItemId = lineItemId;
            Score = score;
        }

        /// <summary>
        /// Get or set the context id.
        /// </summary>
        public string ContextId { get; set; }

        /// <summary>
        /// Get or set the line item Id.
        /// </summary>
        public string LineItemId { get; }

        /// <summary>
        /// The score.
        /// </summary>
        public Score Score { get; set; }
    }
}
