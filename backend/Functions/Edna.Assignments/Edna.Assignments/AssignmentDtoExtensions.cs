// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using Microsoft.Extensions.Logging;
using Microsoft.Azure.Cosmos.Table;
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

            string partitionKey = "", rowKey = "";
            try
            {
                partitionKey = GetDecoded(assignmentIdParts[0]);
            }
            catch (FormatException e)
            {
                _logger.LogError($"Error while decoding partitionKey. Did not decode rowKey\n{e}");
                return (partitionKey, rowKey);
            }
            try
            {
                rowKey = GetDecoded(assignmentIdParts[1]);
            }
            catch (FormatException e)
            {
                _logger.LogError($"Error while decoding rowKey.\n{e}");
            }

            return (partitionKey, rowKey);
        }

        public static string ToAssignmentId(this ITableEntity entity) => $"{GetEncoded(entity.PartitionKey)}_{GetEncoded(entity.RowKey)}";
    }
}
