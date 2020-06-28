using System;

namespace Edna.Bindings.Assignment.Models
{
    public class Assignment
    {
        public string Id { get; set; }
        public string ContextId { get; set; }
        public string ResourceLinkId { get; set; }
        public string Name { get; set; }
        public DateTime? Deadline { get; set; }
        public string Description { get; set; }
        public string CourseName { get; set; }
        public string LtiVersion { get; set; }
        public string ContextMembershipsUrl { get; set; }
        public string OAuthConsumerKey { get; set; }
        public PublishStatus? PublishStatus { get; set; }
        public string PlatformId { get; set; }
    }
}