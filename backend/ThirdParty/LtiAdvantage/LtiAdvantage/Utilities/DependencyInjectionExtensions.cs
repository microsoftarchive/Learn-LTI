using System;
using LtiAdvantage.Utilities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Infrastructure;

// ReSharper disable UnusedMethodReturnValue.Global
// ReSharper disable once CheckNamespace
namespace Microsoft.Extensions.DependencyInjection
{
    /// <summary>
    /// Extension methods for registering additional services.
    /// </summary>
    public static class DependencyInjectionExtensions
    {
        /// <summary>
        /// Adds LTI Advantage authorization policy provider that converts the policy name into
        /// a <see cref="ClaimsAuthorizationRequirement"/>s of type "scope".
        /// </summary>
        public static IServiceCollection AddLtiAdvantagePolicies(this IServiceCollection services)
        {
            if (services == null)
            {
                throw new ArgumentNullException(nameof(services));
            }

            services.AddLogging();

            services.AddSingleton<IAuthorizationPolicyProvider, AuthorizationScopePolicyProvider>();

            return services;
        }
    }
}
