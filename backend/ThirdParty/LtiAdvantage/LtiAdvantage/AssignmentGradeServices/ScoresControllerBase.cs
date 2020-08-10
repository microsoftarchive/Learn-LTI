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
    /// Implements the Assignment and Grade Services score publish service endpoint.
    /// </summary>
    [ApiController]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public abstract class ScoresControllerBase : ControllerBase, IScoresController
    {
        private readonly IHostingEnvironment _env;
        private readonly ILogger<ScoresControllerBase> _logger;

        /// <summary>
        /// </summary>
        protected ScoresControllerBase(IHostingEnvironment env, ILogger<ScoresControllerBase> logger)
        {
            _env = env;
            _logger = logger;
        }
                
        /// <summary>
        /// Add a score to the line item.
        /// </summary>
        /// <param name="request">The request parameters.</param>
        /// <returns></returns>
        protected abstract Task<ActionResult<Score>> OnAddScoreAsync(AddScoreRequest request);
                        
        /// <summary>
        /// Returns a score.
        /// </summary>
        /// <param name="request">The request parameters.</param>
        /// <returns></returns>
        protected abstract Task<ActionResult<Score>> OnGetScoreAsync(GetScoreRequest request);

        /// <summary>
        /// Adds a score to a line item.
        /// </summary>
        /// <param name="contextId">The context id.</param>
        /// <param name="lineItemId">The line item id.</param>
        /// <param name="score">The score to add.</param>
        /// <returns>The new score.</returns>
        [HttpPost]
        [Consumes(Constants.MediaTypes.Score)]
        [Produces(Constants.MediaTypes.Score)]
        [ProducesResponseType(typeof(Score), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = Constants.LtiScopes.Ags.Score)]
        [Route("context/{contextId}/lineitems/{lineItemId}/scores", Name = Constants.ServiceEndpoints.Ags.ScoresService)]
        [Route("context/{contextId}/lineitems/{lineItemId}/scores.{format}")]
        public async Task<ActionResult<Score>> AddScoreAsync(string contextId, string lineItemId, [Required] [FromBody] Score score)
        {
            try
            {
                _logger.LogDebug($"Entering {nameof(AddScoreAsync)}.");

                try
                {
                    var request = new AddScoreRequest(contextId, lineItemId, score);
                    return await OnAddScoreAsync(request).ConfigureAwait(false);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"An unexpected error occurred in {nameof(AddScoreAsync)}.");
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
                _logger.LogDebug($"Exiting {nameof(AddScoreAsync)}.");
            }
        }

        /// <summary>
        /// Returns a score.
        /// </summary>
        /// <remarks>
        /// This is not part of the Assignment and Grades Services spec.
        /// </remarks>
        /// <param name="contextId">The context id.</param>
        /// <param name="lineItemId">The line item id.</param>
        /// <param name="scoreId">The score id.</param>
        /// <returns>The score.</returns>
        [HttpGet]
        [Produces(Constants.MediaTypes.Score)]
        [ProducesResponseType(typeof(Score), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, 
            Policy = Constants.LtiScopes.Ags.ScoreReadonly + " " + Constants.LtiScopes.Ags.Score)]
        [Route("context/{contextId}/lineitems/{lineItemId}/scores/{scoreId}", Name = Constants.ServiceEndpoints.Ags.ScoreService)]
        [Route("context/{contextId}/lineitems/{lineItemId}/scores/{scoreId}.{format}")]
        public async Task<ActionResult<Score>> GetScoreAsync([Required] string contextId, 
            [Required] string lineItemId, [Required] string scoreId)
        {
            try
            {
                _logger.LogDebug($"Entering {nameof(GetScoreAsync)}.");

                try
                {
                    var request = new GetScoreRequest(contextId, lineItemId, scoreId);
                    return await OnGetScoreAsync(request).ConfigureAwait(false);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Cannot get score.");
                    return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
                    {
                        Title = ex.Message,
                        Detail = ex.StackTrace
                    });
                }
            }
            finally
            {
                _logger.LogDebug($"Exiting {nameof(GetScoreAsync)}.");
            }
        }
    }
}

