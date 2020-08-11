using Microsoft.WindowsAzure.Storage.Table;
using System;
using System.Runtime.InteropServices.ComTypes;
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
            try
            {
                byte[] base64EncodedBytes = Convert.FromBase64String(encodedStr);
                return Encoding.UTF8.GetString(base64EncodedBytes);
            }
            catch(Exception e)
            {
                return "";
            }

        }

        public static (string partitionKey, string rowKey) ToEntityIdentifiers(this string assignmentId)
        {
            if (string.IsNullOrEmpty(assignmentId))
                return ("", "");

            string[] assignmentIdParts = assignmentId.Split("_");
            if (assignmentIdParts.Length != 2)
                return ("", "");

            return (GetDecoded(assignmentIdParts[0]), GetDecoded(assignmentIdParts[1]));
        }

        public static string ToAssignmentId(this ITableEntity entity) => $"{GetEncoded(entity.PartitionKey)}_{GetEncoded(entity.RowKey)}";
    }
}
