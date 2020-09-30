using Edna.Utils.Http;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.DependencyInjection;

namespace Edna.Bindings.Assignment
{
    public static class AssignmentBindingExtensions
    {
        public static IWebJobsBuilder AddAssignmentBinding(this IWebJobsBuilder builder)
        {
            builder.AddExtension<AssignmentExtensionConfigProvider>();

            builder.Services.AddHttpClient();
            builder.Services.AddHttpClient(EdnaHttpHandler.Name).ConfigurePrimaryHttpMessageHandler(() => new EdnaHttpHandler());

            builder.Services.AddSingleton<AssignmentsCollector.Converter>();
            builder.Services.AddSingleton<AssignmentsClient.Factory>();

            builder.Services.AddSingleton<AssignmentsClient>();

            return builder;
        }
    }
}