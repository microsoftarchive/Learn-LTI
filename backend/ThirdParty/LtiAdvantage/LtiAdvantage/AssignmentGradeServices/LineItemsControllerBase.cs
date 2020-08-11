using System;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace LtiAdvantage.AssignmentGradeServices
{
    /// <inheritdoc cref="ControllerBase" />
    /// <summary>
    /// Implements the Assignment and Grade Services line items endpoint.
    /// </summary>
    [ApiController]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public abstract class LineItemsControllerBase : ControllerBase, ILineItemsController
    {
        private readonly IHostingEnvironment _env;
        private readonly ILogger<LineItemsControllerBase> _logger;

        /// <summary>
        /// </summary>
        protected LineItemsControllerBase(IHostingEnvironment env, ILogger<LineItemsControllerBase> logger)
        {
            _env = env;
            _logger = logger;
        }

        /// <summary>
        /// Add a line item to the context.
        /// </summary>
        /// <param name="request">The request parameters.</param>
        /// <returns>The line item.</returns>
        protected abstract Task<ActionResult<LineItem>> OnAddLineItemAsync(AddLineItemRequest request);
        
        /// <summary>
        /// Deletes a line item.
        /// </summary>
        /// <param name="request">The request parameters.</param>
        /// <returns>The result.</returns>
        protected abstract Task<ActionResult> OnDeleteLineItemAsync(DeleteLineItemRequest request);

        /// <summary>
        /// Get a line item.
        /// </summary>
        /// <param name="request">The request parameters.</param>
        /// <returns>The line item.</returns>
        protected abstract Task<ActionResult<LineItem>> OnGetLineItemAsync(GetLineItemRequest request);

        /// <summary>
        /// Get the line items for a context.
        /// </summary>
        /// <param name="request">The request parameters.</param>
        /// <returns>The line items.</returns>
        protected abstract Task<ActionResult<LineItemContainer>> OnGetLineItemsAsync(GetLineItemsRequest request);
        
        /// <summary>
        /// Updates a line item.
        /// </summary>
        /// <param name="request">The request parameters.</param>
        /// <returns>The result.</returns>
        protected abstract Task<ActionResult> OnUpdateLineItemAsync(UpdateLineItemRequest request);
        
        /// <summary>
        /// Adds a line item to a context.
        /// </summary>
        /// <param name="contextId">The context id.</param>
        /// <param name="lineItem">The line item to add.</param>
        /// <returns>The line item added.</returns>
        [HttpPost]
        [Consumes(Constants.MediaTypes.LineItem)]
        [Produces(Constants.MediaTypes.LineItem)]
        [ProducesResponseType(typeof(LineItem), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = Constants.LtiScopes.Ags.LineItem)]
        [Route("context/{contextId}/lineitems", Name = Constants.ServiceEndpoints.Ags.LineItemsService)]
        [Route("context/{contextId}/lineitems.{format}")]
        public async Task<ActionResult<LineItem>> AddLineItemAsync([Required] string contextId, [Required] [FromBody] LineItem lineItem)
        {
            try
            {
                _logger.LogDebug($"Entering {nameof(AddLineItemAsync)}.");

                try
                {
                    var request = new AddLineItemRequest(contextId, lineItem);
                    return await OnAddLineItemAsync(request).ConfigureAwait(false);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"An unexpected error occurred in {nameof(OnAddLineItemAsync)}.");
                    return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
                    {
                        Title = "An unexpected error occurred",
                        Status = StatusCodes.Status500InternalServerError,
                        Detail = _env.IsDevelopment()
                            ? ex.Message + ex.StackTrace
                            : ex.Message
                    });
                }
            }
            finally
            {
                _logger.LogDebug($"Exiting {nameof(AddLineItemAsync)}.");
            }
        }

        /// <summary>
        /// Deletes a line item.
        /// </summary>
        /// <param name="contextId">The context id.</param>
        /// <param name="lineItemId">The line item id.</param>
        /// <returns>The result.</returns>
        [HttpDelete]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = Constants.LtiScopes.Ags.LineItem)]
        [Route("context/{contextId}/lineitems/{lineItemId}", Name = Constants.ServiceEndpoints.Ags.LineItemService)]
        [Route("context/{contextId}/lineitems/{lineItemId}.{format}")]
        public async Task<ActionResult> DeleteLineItemAsync([Required] string contextId, [Required] string lineItemId)
        {
            try
            {
                _logger.LogDebug($"Entering {nameof(DeleteLineItemAsync)}.");

                try
                {
                    var request = new DeleteLineItemRequest(contextId, lineItemId);
                    return await OnDeleteLineItemAsync(request).ConfigureAwait(false);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"An unexpected error occurred in {nameof(DeleteLineItemAsync)}.");
                    return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
                    {
                        Title = "An unexpected error occurred",
                        Status = StatusCodes.Status500InternalServerError,
                        Detail = _env.IsDevelopment()
                            ? ex.Message + ex.StackTrace
                            : ex.Message
                    });
                }
            }
            finally 
            {
                _logger.LogDebug($"Entering {nameof(DeleteLineItemAsync)}.");
            }
        }

        /// <summary>
        /// Returns a line item.
        /// </summary>
        /// <param name="contextId">The context id.</param>
        /// <param name="lineItemId">The line item id.</param>
        /// <returns>The line item.</returns>
        [HttpGet]
        [Produces(Constants.MediaTypes.LineItem)]
        [ProducesResponseType(typeof(LineItem), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, 
            Policy = Constants.LtiScopes.Ags.LineItem + " " + Constants.LtiScopes.Ags.LineItemReadonly)]
        [Route("context/{contextId}/lineitems/{lineItemId}", Name = Constants.ServiceEndpoints.Ags.LineItemService)]
        [Route("context/{contextId}/lineitems/{lineItemId}.{format}")]
        public async Task<ActionResult<LineItem>> GetLineItemAsync([Required] string contextId, [Required] string lineItemId)
        {
            try
            {
                _logger.LogDebug($"Entering {nameof(GetLineItemAsync)}.");

                try
                {
                    var request = new GetLineItemRequest(contextId, lineItemId);
                    return await OnGetLineItemAsync(request).ConfigureAwait(false);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"An unexpected error occurred in {nameof(GetLineItemAsync)}.");
                    return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
                    {
                        Title = "An unexpected error occurred",
                        Status = StatusCodes.Status500InternalServerError,
                        Detail = _env.IsDevelopment()
                            ? ex.Message + ex.StackTrace
                            : ex.Message
                    });
                }
            }
            finally
            {
                _logger.LogDebug($"Exiting {nameof(GetLineItemAsync)}.");
            }
        }

        /// <summary>
        /// Returns the line items in a context.
        /// </summary>
        /// <param name="contextId">The context id.</param>
        /// <param name="resourceLinkId">Optional resource link id filter.</param>
        /// <param name="resourceId">Optional resource id filter.</param>
        /// <param name="tag">Optional tag filter.</param>
        /// <param name="limit">Optional limit on number of line items to return.</param>
        /// <returns>The line items.</returns>
        [HttpGet]
        [Produces(Constants.MediaTypes.LineItemContainer)]
        [ProducesResponseType(typeof(LineItemContainer), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, 
            Policy = Constants.LtiScopes.Ags.LineItem + " " + Constants.LtiScopes.Ags.LineItemReadonly)]
        [Route("context/{contextId}/lineitems", Name = Constants.ServiceEndpoints.Ags.LineItemsService)]
        [Route("context/{contextId}/lineitems.{format}")]
        public async Task<ActionResult<LineItemContainer>> GetLineItemsAsync([Required] string contextId,
            [FromQuery(Name = "resourceLinkId")] string resourceLinkId = null,
            [FromQuery(Name = "resourceId")] string resourceId = null,
            [FromQuery] string tag = null,
            [FromQuery] int? limit = null)
        {
            try
            {
                _logger.LogDebug($"Entering {nameof(GetLineItemsAsync)}.");

                try
                {
                    var request = new GetLineItemsRequest(contextId, resourceLinkId, resourceId, tag, limit);
                    return await OnGetLineItemsAsync(request).ConfigureAwait(false);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"An unexpected error occurred in {nameof(OnGetLineItemsAsync)}.");
                    return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
                    {
                        Title = "An unexpected error occurred",
                        Status = StatusCodes.Status500InternalServerError,
                        Detail = _env.IsDevelopment()
                                 ? ex.Message + ex.StackTrace
                                 : ex.Message
                    });
                }
            }
            finally
            {
                _logger.LogDebug($"Exiting {nameof(GetLineItemsAsync)}.");
            }
        }

        /// <summary>
        /// Updates a line item.
        /// </summary>
        /// <param name="contextId">The context id.</param>
        /// <param name="lineItemId">The line item id.</param>
        /// <param name="lineItem">The updated line item.</param>
        /// <returns>The result.</returns>
        [HttpPut]
        [Consumes(Constants.MediaTypes.LineItem)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = Constants.LtiScopes.Ags.LineItem)]
        [Route("context/{contextId}/lineitems/{lineItemId}", Name = Constants.ServiceEndpoints.Ags.LineItemService)]
        [Route("context/{contextId}/lineitems/{lineItemId}.{format}")]
        public async Task<ActionResult> UpdateLineItemAsync([Required] string contextId, [Required] string lineItemId, [Required] LineItem lineItem)
        {
            try
            {
                _logger.LogDebug($"Entering {nameof(UpdateLineItemAsync)}.");

                try
                {
                    var request = new UpdateLineItemRequest(contextId, lineItemId, lineItem);
                    return await OnUpdateLineItemAsync(request).ConfigureAwait(false);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"An unexpected error occurred in {nameof(OnAddLineItemAsync)}.");
                    return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
                    {
                        Title = "An unexpected error occurred",
                        Status = StatusCodes.Status500InternalServerError,
                        Detail = _env.IsDevelopment()
                            ? ex.Message + ex.StackTrace
                            : ex.Message
                    });
                }
            }
            finally
            {
                _logger.LogDebug($"Exiting {nameof(UpdateLineItemAsync)}.");
            }
        }
    }
}