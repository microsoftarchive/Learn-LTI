using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace LtiAdvantage.AssignmentGradeServices
{
    /// <summary>
    /// The activity progress or status.
    /// </summary>
    [JsonConverter(typeof(StringEnumConverter))]
    public enum ActivityProgress
    {
        /// <summary>
        /// Unknown activity progress.
        /// </summary>
        None = 0,

        /// <summary>
        /// The user has completed the activity associated with the line item.
        /// </summary>
        Completed = 1,

        /// <summary>
        /// The user has not started the activity, or the activity has been reset for that student.
        /// </summary>
        Initialized = 2,

        /// <summary>
        /// The activity is being drafted and is available for comment.
        /// </summary>
        InProgress = 3,

        /// <summary>
        /// The activity associated with the line item has been started by the user.
        /// </summary>
        Started = 4,

        /// <summary>
        /// The activity has been submitted at least once by the user but is still able to make further submissions.
        /// </summary>
        Submitted = 5
    }
}
