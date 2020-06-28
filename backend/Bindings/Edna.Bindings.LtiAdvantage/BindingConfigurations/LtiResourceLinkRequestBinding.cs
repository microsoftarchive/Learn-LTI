using System;
using System.Threading.Tasks;
using Edna.Bindings.LtiAdvantage.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.Azure.WebJobs.Host.Bindings;
using Microsoft.Azure.WebJobs.Host.Protocols;

namespace Edna.Bindings.LtiAdvantage.BindingConfigurations
{
    public class LtiResourceLinkRequestBinding : IBinding
    {
        public Task<IValueProvider> BindAsync(object value, ValueBindingContext context) => throw new NotSupportedException();

        public Task<IValueProvider> BindAsync(BindingContext context)
        {
            HttpRequest httpRequest = context.GetHttpRequest();

            return Task.FromResult<IValueProvider>(new LtiResourceLinkRequestValueProvider(httpRequest));
        }

        public ParameterDescriptor ToParameterDescriptor() => new ParameterDescriptor();
        public bool FromAttribute => true;
    }
}