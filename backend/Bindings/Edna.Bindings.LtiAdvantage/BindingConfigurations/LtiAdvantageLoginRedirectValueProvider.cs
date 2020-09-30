using System;
using System.Threading.Tasks;
using Edna.Bindings.LtiAdvantage.Models;
using Edna.Bindings.LtiAdvantage.Services;
using Microsoft.Azure.WebJobs.Host.Bindings;

namespace Edna.Bindings.LtiAdvantage.BindingConfigurations
{
    public class LtiAdvantageLoginRedirectValueProvider : IValueProvider
    {
        private readonly LoginParams _loginParams;

        public LtiAdvantageLoginRedirectValueProvider(LoginParams loginParams)
        {
            _loginParams = loginParams;
        }

        public Task<object> GetValueAsync() => Task.FromResult<object>(new OidcClient(_loginParams));

        public string ToInvokeString() => "LoginRedirect";

        public Type Type { get; } = typeof(OidcClient);
    }
}