using System;
using System.Threading.Tasks;
using Edna.Bindings.LtiAdvantage.Models;
using Edna.Bindings.LtiAdvantage.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.Azure.WebJobs.Host.Bindings;
using Microsoft.Azure.WebJobs.Host.Protocols;

namespace Edna.Bindings.LtiAdvantage.BindingConfigurations
{
    public class LtiAdvantageOidcLoginBinding : IBinding
    {
        public Task<IValueProvider> BindAsync(object value, ValueBindingContext context) => throw new NotSupportedException();

        public async Task<IValueProvider> BindAsync(BindingContext context)
        {
            HttpRequest httpRequest = context.GetHttpRequest();
            IFormCollection form = await (httpRequest?.ReadFormAsync() ?? Task.FromResult<IFormCollection>(null));
            if (form == null)
                throw new NullReferenceException("The HTTP form could not be fetched.");
            
            LoginParams loginParams = new LoginParams
            {
                TargetLinkUri = form["target_link_uri"].ToString(),
                LoginHint = form["login_hint"].ToString(),
                LtiMessageHint = form["lti_message_hint"]
            };
            return new LtiAdvantageLoginRedirectValueProvider(loginParams);
        }

        public ParameterDescriptor ToParameterDescriptor() => new ParameterDescriptor();

        public bool FromAttribute => true;
    }
}