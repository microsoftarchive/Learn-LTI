using AutoMapper;
using Edna.AssignmentLearnContent;
using Edna.Bindings.Assignment;
using Edna.Bindings.Platform;
using Edna.Bindings.LtiAdvantage;
using Edna.Bindings.Lti1;
using Microsoft.Azure.Functions.Extensions.DependencyInjection;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Hosting;
using Microsoft.Extensions.DependencyInjection;

[assembly: FunctionsStartup(typeof(Startup))]

namespace Edna.AssignmentLearnContent
{
    public class Startup : IWebJobsStartup
    {
        public void Configure(IWebJobsBuilder builder)
        {
            builder.Services.AddLogging();

            builder.AddPlatformBinding();
            builder.AddLtiAdvantageBindings();
            builder.AddLti1Binding();
            builder.AddAssignmentBinding();

            builder.Services.AddHttpClient();
            builder.Services.AddAutoMapper(GetType().Assembly);
        }
    }
}