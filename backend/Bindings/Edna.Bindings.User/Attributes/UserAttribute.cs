using System;
using Microsoft.Azure.WebJobs.Description;

namespace Edna.Bindings.User.Attributes
{
    [Binding]
    [AttributeUsage(AttributeTargets.Parameter)]
    public class UserAttribute : Attribute
    {
        public string ServiceUrlEnvironmentVariable { get; set; } = "UsersServiceUrl";

        [AutoResolve]
        public string AssignmentId { get; set; }
    }
}