using Microsoft.WindowsAzure.Storage.Table;

namespace Edna.Assignments
{
    public static class AssignmentExtensions
    {
        public static (string partitionKey, string rowKey) ToEntityIdentifiers(this string assignmentId)
        {
            if (string.IsNullOrEmpty(assignmentId))
                return ("", "");

            string[] assignmentIdParts = assignmentId.Split("_");
            if (assignmentIdParts.Length != 2)
                return ("", "");

            return (assignmentIdParts[0], assignmentIdParts[1]);
        }

        public static string ToAssignmentId(this ITableEntity entity) => $"{entity.PartitionKey}_{entity.RowKey}";
    }
}