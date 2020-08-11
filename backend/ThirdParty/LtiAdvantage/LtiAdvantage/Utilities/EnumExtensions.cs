using System;
using System.Linq;
using System.Reflection;

namespace LtiAdvantage.Utilities
{
    /// <summary>
    /// Enum extensions.
    /// </summary>
    public static class EnumExtensions
    {
        /// <summary>
        /// Return the URI associated with this Enum value.
        /// </summary>
        public static string[] GetUris(this Enum value)
        {
            return 
                value.GetType()
                .GetRuntimeFields()
                .SingleOrDefault(f => f.Name == value.ToString())
                ?.GetCustomAttributes<UriAttribute>()
                .Select(a => a.Uri)
                .ToArray();
        }
    }
}
