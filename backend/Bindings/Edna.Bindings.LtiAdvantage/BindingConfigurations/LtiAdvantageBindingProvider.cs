using System;
using System.Threading.Tasks;
using Edna.Bindings.LtiAdvantage.Models;
using Edna.Bindings.LtiAdvantage.Services;
using LtiAdvantage.Lti;
using Microsoft.Azure.WebJobs.Host.Bindings;

namespace Edna.Bindings.LtiAdvantage.BindingConfigurations
{
    public class LtiAdvantageBindingProvider : IBindingProvider
    {
        public Task<IBinding> TryCreateAsync(BindingProviderContext context)
        {
            if (context.Parameter.ParameterType == typeof(OidcClient))
                return Task.FromResult((IBinding) new LtiAdvantageOidcLoginBinding());

            if (context.Parameter.ParameterType == typeof(ILtiResourceLinkRequestClient))
                return Task.FromResult((IBinding) new LtiResourceLinkRequestBinding());

            throw new NotSupportedException($"The provided parameter type '{context.Parameter.ParameterType}' is not supported.");
        }
    }
}