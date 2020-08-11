namespace LtiAdvantage.AssignmentGradeServices
{
    /// <summary>
    /// Represents a DeleteLineItem request.
    /// </summary>
    public class DeleteLineItemRequest
    {
        /// <summary>
        /// Initialize a new instance of the class.
        /// </summary>
        public DeleteLineItemRequest(string contextId, string lineItemId)
        {
            ContextId = contextId;
            LineItemId = lineItemId;
        }

        /// <summary>
        /// Get or set the ContextId.
        /// </summary>
        public string ContextId { get; set; }

        /// <summary>
        /// Get or set the Id.
        /// </summary>
        public string LineItemId { get; }
    }
}
