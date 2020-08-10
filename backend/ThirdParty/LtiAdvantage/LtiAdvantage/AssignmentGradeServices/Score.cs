using System;
using Newtonsoft.Json;

namespace LtiAdvantage.AssignmentGradeServices
{
    /// <summary>
    /// Represents a score.
    /// </summary>
    public class Score
    {
        /// <summary>
        /// Status of the user toward activity's completion.
        /// </summary>
        [JsonProperty("activityProgress")]
        public ActivityProgress ActivityProgress { get; set; }

        /// <summary>
        /// A comment with the score.
        /// </summary>
        [JsonProperty("comment")]
        public string Comment { get; set; }

        /// <summary>
        /// The status of the grading process.
        /// </summary>
        [JsonProperty("gradingProgress")]
        public GradingProgess GradingProgress { get; set; }

        /// <summary>
        /// The score.
        /// </summary>
        [JsonProperty("scoreGiven")]
        public double ScoreGiven { get; set; }

        /// <summary>
        /// The maximum possible score.
        /// </summary>
        [JsonProperty("scoreMaximum")]
        public double ScoreMaximum { get; set; }

        /// <summary>
        /// The UTC time the score was set. ISO 8601 format.
        /// </summary>
        [JsonProperty("timestamp")]
        public DateTime TimeStamp { get; set; }

        /// <summary>
        /// The user id.
        /// </summary>
        [JsonProperty("userId")]
        public string UserId { get; set; }
    }
}
