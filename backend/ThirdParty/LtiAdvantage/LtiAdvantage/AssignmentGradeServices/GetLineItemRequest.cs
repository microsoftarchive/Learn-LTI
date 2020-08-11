namespace LtiAdvantage.AssignmentGradeServices
{
    /// <summary>
    /// Represents a GetLineItem request.
    /// </summary>
    public class GetLineItemRequest
    {
        /// <summary>
        /// Initialize a new instance of the class.
        /// </summary>
        public GetLineItemRequest(string contextId, string lineItemId)
        {
            ContextId = contextId;
            LineItemId = lineItemId;
        }

        /// <summary>
        /// Get or set the context id.
        /// </summary>
        public string ContextId { get; set; }

        /// <summary>
        /// Get or set the line item Id.
        /// </summary>
        public string LineItemId { get; }
    }
}
