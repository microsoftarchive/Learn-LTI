using System.Collections.Generic;

namespace LtiAdvantage.AssignmentGradeServices
{
    /// <inheritdoc />
    /// <summary>
    /// A collection of results.
    /// </summary>
    public class ResultContainer : List<Result>
    {
        /// <inheritdoc />
        /// <summary>
        /// Create an empty ResultContainer
        /// </summary>
        public ResultContainer()
        {
        }

        /// <inheritdoc />
        /// <summary>
        /// Create a ResultContainer that contains the results.
        /// </summary>
        /// <param name="results"></param>
        public ResultContainer(IEnumerable<Result> results) : base(results)
        {
        }
    }
}
