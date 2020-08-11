namespace LtiAdvantage.AssignmentGradeServices
{
    /// <summary>
    /// Represents an update line item request.
    /// </summary>
    public class UpdateLineItemRequest
    {
        /// <summary>
        /// Initialize a new instance of the class.
        /// </summary>
        public UpdateLineItemRequest(string contextId, string lineItemId, LineItem lineItem)
        {
            ContextId = contextId;
            LineItemId = lineItemId;
            LineItem = lineItem;
        }

        /// <summary>
        /// Get or set the context id.
        /// </summary>
        public string ContextId { get; set; }

        /// <summary>
        /// Get or set the line item.
        /// </summary>
        public LineItem LineItem { get; }

        /// <summary>
        /// Get or set the line item id.
        /// </summary>
        public string LineItemId { get; set; }
    }
}
