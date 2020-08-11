using LtiAdvantage.Utilities;
using Newtonsoft.Json;

namespace LtiAdvantage.Lti
{
    /// <summary>
    /// Represents LIS Context Types
    /// </summary>
    [JsonConverter(typeof(ContextTypeConverter))]
    public enum ContextType
    {
        /// <summary>
        /// Unknown course type. Examine the claim directly.
        /// </summary>
        Unknown = 0,

        /// <summary>
        /// A course template is the abstract course which is independent of when it is taught.
        /// The course template may have one or more course offerings, each of which may have one
        /// or more course sections.
        /// </summary>
        [Uri("http://purl.imsglobal.org/vocab/lis/v2/course#CourseTemplate")]
        [Uri("urn:lti:context-type:ims/lis/CourseTemplate")]
        [Uri("CourseTemplate")]
        CourseTemplate,

        /// <summary>
        /// A course offering relates to the specific period of time when the course is available.
        /// </summary>
        [Uri("http://purl.imsglobal.org/vocab/lis/v2/course#CourseOffering")]
        [Uri("urn:lti:context-type:ims/lis/CourseOffering")]
        [Uri("CourseOffering")]
        CourseOffering,
        
        /// <summary>
        /// A course section is the specific instance into which students are enrolled and taught.
        /// </summary>
        [Uri("http://purl.imsglobal.org/vocab/lis/v2/course#CourseSection")]
        [Uri("urn:lti:context-type:ims/lis/CourseSection")]
        [Uri("CourseSection")]
        CourseSection,
        
        /// <summary>
        /// A course group within a course section.
        /// </summary>
        [Uri("http://purl.imsglobal.org/vocab/lis/v2/course#Group")]
        [Uri("urn:lti:context-type:ims/lis/Group")]
        [Uri("Group")]
        Group
    }
}
