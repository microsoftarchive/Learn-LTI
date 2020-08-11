namespace LtiAdvantage.AssignmentGradeServices
{
    /// <summary>
    /// Represents a create item request request.
    /// </summary>
    public class AddLineItemRequest
    {
        /// <summary>
        /// Initialize a new instance of the class.
        /// </summary>
        public AddLineItemRequest(string contextId, LineItem lineItem)
        {
            ContextId = contextId;
            LineItem = lineItem;
        }

        /// <summary>
        /// The context id.
        /// </summary>
        public string ContextId { get; set; }

        /// <summary>
        /// The line item.
        /// </summary>
        public LineItem LineItem { get; set; }
    }
}
