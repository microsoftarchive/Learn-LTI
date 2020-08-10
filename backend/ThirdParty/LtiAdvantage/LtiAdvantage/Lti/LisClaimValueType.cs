using Newtonsoft.Json;

namespace LtiAdvantage.Lti
{
    /// <summary>
    /// Properties about available Learning Information Services (LIS),
    /// usually originating from the Student Information System.
    /// </summary>
    public class LisClaimValueType
    {
        /// <summary>
        /// </summary>
        [JsonProperty("course_offering_sourcedid")]
        public string CourseOfferingSourcedId { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty("course_section_sourcedid")]
        public string CourseSectionSourcedId { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty("person_sourcedid")]
        public string PersonSourcedId { get; set; }
    }
}
