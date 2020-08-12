using Microsoft.Extensions.Logging;
using Microsoft.WindowsAzure.Storage.Table;
using System;
using System.Text;

namespace Edna.Assignments
{
    public static class AssignmentExtensions
    {
        private static string GetEncoded(string rawStr)
        {
            byte[] textBytes = Encoding.UTF8.GetBytes(rawStr);
            return Convert.ToBase64String(textBytes);
        }

        private static string GetDecoded(string encodedStr)
        {
            byte[] base64EncodedBytes = Convert.FromBase64String(encodedStr);
            return Encoding.UTF8.GetString(base64EncodedBytes);
        }

        public static (string partitionKey, string rowKey) ToEntityIdentifiers(this string assignmentId, ILogger<AssignmentsApi> _logger)
        {
            if (string.IsNullOrEmpty(assignmentId))
                return ("", "");

            string[] assignmentIdParts = assignmentId.Split("_");
            if (assignmentIdParts.Length != 2)
                return ("", "");

            string decodedPartitionKey = "", decodedRowKey = "";
            try
            {
                decodedPartitionKey = GetDecoded(assignmentIdParts[0]);
            }
            catch (FormatException e)
            {
                _logger.LogError($"Error while decoding partitionKey.\n{e}");
            }

            try
            {
                decodedRowKey = GetDecoded(assignmentIdParts[1]);
            }
            catch (FormatException e)
            {
                _logger.LogError($"Error while decoding rowKey.\n{e}");
            }

            return (decodedPartitionKey, decodedRowKey);
        }

        public static string ToAssignmentId(this ITableEntity entity) => $"{GetEncoded(entity.PartitionKey)}_{GetEncoded(entity.RowKey)}";
    }
}
