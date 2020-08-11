using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace LtiAdvantage.Utilities
{
    /// <inheritdoc />
    /// <summary>
    /// Dynamically add required scope authorization policy.
    /// See https://www.jerriepelser.com/blog/creating-dynamic-authorization-policies-aspnet-core/.
    /// </summary>
    /// <example>
    /// To protect an API:
    /// 
    /// [Authorize(Policy = "scope")]
    /// </example>
    /// <example>
    /// If either scope is sufficient, separate with a space:
    /// 
    /// [Authorize("scope1 scope2")]
    /// </example>
    public class AuthorizationScopePolicyProvider : DefaultAuthorizationPolicyProvider
    {
        private readonly ILogger<AuthorizationScopePolicyProvider> _logger;
        private readonly IOptions<AuthorizationOptions> _options;

        /// <inheritdoc />
        /// <summary>
        /// </summary>
        public AuthorizationScopePolicyProvider(
            ILogger<AuthorizationScopePolicyProvider> logger,
            IOptions<AuthorizationOptions> options) : base(options)
        {
            _logger = logger;
            _options = options;
        }

        /// <inheritdoc />
        /// <summary>
        /// Returns a policy that requires a scope claim = policyName.
        /// </summary>
        /// <param name="policyName"></param>
        /// <returns></returns>
        public override async Task<AuthorizationPolicy> GetPolicyAsync(string policyName)
        {
            if (string.IsNullOrWhiteSpace(policyName))
            {
                _logger.LogError($"{nameof(policyName)} is required.");
                return null;
            }

            // Check static policies first
            var policy = await base.GetPolicyAsync(policyName);

            if (policy == null)
            {
                _logger.LogInformation($"Adding required scope {policyName}.");

                policy = new AuthorizationPolicyBuilder().AddRequirements()
                    .RequireClaim("scope", policyName.Split(' '))
                    .Build();

                // Add policy to the AuthorizationOptions, so we don't have to re-create it each time
                _options.Value.AddPolicy(policyName, policy);
            }

            return policy;
        }
    }
}
