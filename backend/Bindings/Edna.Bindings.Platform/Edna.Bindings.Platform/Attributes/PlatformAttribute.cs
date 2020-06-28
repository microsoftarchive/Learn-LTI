using System;
using Microsoft.Azure.WebJobs.Description;

namespace Edna.Bindings.Platform.Attributes
{
    [Binding]
    [AttributeUsage(AttributeTargets.Parameter)]
    public class PlatformAttribute : Attribute
    {
        public string ServiceUrlEnvironmentVariable { get; set; } = "PlatformsServiceUrl";

        [AutoResolve]
        public string PlatformId { get; set; }
    }
}