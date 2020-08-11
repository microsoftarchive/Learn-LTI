using Microsoft.AspNetCore.Http;

namespace LtiAdvantage.Lti
{
    /// <summary>
    /// Represents an LTI service response.
    /// </summary>
    public class ServiceResponse
    {
        /// <summary>
        /// Create an empty response
        /// </summary>
        public ServiceResponse()
        {
            StatusCode = StatusCodes.Status200OK;
        }

        /// <summary>
        /// Get or set the HTTP status code representing the success or failure of the membership
        /// service request.
        /// </summary>
        public int StatusCode { get; set; }

        /// <summary>
        /// Get or set the HTTP status value representing the success or failure of the membership
        /// service request.
        /// </summary>
        public object StatusValue { get; set; }
    }
}
