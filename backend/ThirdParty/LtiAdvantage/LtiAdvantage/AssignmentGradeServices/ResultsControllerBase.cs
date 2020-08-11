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
    /// Implements the Assignment and Grade Services results endpoint.
    /// </summary>
    [ApiController]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public abstract class ResultsControllerBase : ControllerBase, IResultsController
    {
        private readonly IHostingEnvironment _env;
        private readonly ILogger<ResultsControllerBase> _logger;

        /// <summary>
        /// </summary>
        protected ResultsControllerBase(IHostingEnvironment env, ILogger<ResultsControllerBase> logger)
        {
            _env = env;
            _logger = logger;
        }
                
        /// <summary>
        /// Returns the results for a line item.
        /// </summary>
        /// <param name="request">The request parameters.</param>
        /// <returns>The results.</returns>
        protected abstract Task<ActionResult<ResultContainer>> OnGetResultsAsync(GetResultsRequest request);

        /// <summary>
        /// Returns the results for a lineitem.
        /// </summary>
        /// <param name="contextId">The context id.</param>
        /// <param name="lineItemId">The line item id.</param>
        /// <param name="userId">Optional user id filter.</param>
        /// <param name="limit">Optional limit to the number of results returned.</param>
        /// <returns>The results.</returns>
        [HttpGet]
        [Produces(Constants.MediaTypes.ResultContainer)]
        [ProducesResponseType(typeof(ResultContainer), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = Constants.LtiScopes.Ags.ResultReadonly)]
        [Route("context/{contextId}/lineitems/{lineItemId}/results", Name = Constants.ServiceEndpoints.Ags.ResultsService)]
        [Route("context/{contextId}/lineitems/{lineItemId}/results.{format}")]
        public async Task<ActionResult<ResultContainer>> GetResultsAsync([Required] string contextId, [Required] string lineItemId, 
            [FromQuery(Name = "userId")] string userId = null, 
            [FromQuery] int? limit = null)
        {
            try
            {
                _logger.LogDebug($"Entering {nameof(GetResultsAsync)}.");

                try
                {
                    var request = new GetResultsRequest(contextId, lineItemId, userId, limit);
                    return await OnGetResultsAsync(request).ConfigureAwait(false);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"An unexpected error occurred in {nameof(GetResultsAsync)}.");
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
                _logger.LogDebug($"Exiting {nameof(GetResultsAsync)}.");
            }
        }
    }
}

