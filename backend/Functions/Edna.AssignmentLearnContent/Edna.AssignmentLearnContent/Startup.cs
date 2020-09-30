using AutoMapper;
using Edna.AssignmentLearnContent;
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

            builder.Services.AddHttpClient();
            builder.Services.AddAutoMapper(GetType().Assembly);
        }
    }
}