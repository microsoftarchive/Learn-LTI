using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace LtiAdvantage.AssignmentGradeServices
{
    /// <summary>
    /// The grading progress.
    /// </summary>
    [JsonConverter(typeof(StringEnumConverter))]
    public enum GradingProgess
    {
        /// <summary>
        /// Unknown grading progress.
        /// </summary>
        None = 0,

        /// <summary>
        /// The grading could not complete.
        /// </summary>
        Failed = 1,

        /// <summary>
        /// The grading process is completed.
        /// </summary>
        FullyGraded = 2,

        /// <summary>
        /// No grading process occuring.
        /// </summary>
        NotReady = 3,

        /// <summary>
        /// Final grade is pending, and not human intervention required.
        /// </summary>
        Pending = 4,

        /// <summary>
        /// Final graded is pending, and human intervention required.
        /// </summary>
        PendingManual = 5
    }
}
