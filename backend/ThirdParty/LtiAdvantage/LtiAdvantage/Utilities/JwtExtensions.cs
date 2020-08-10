using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using Newtonsoft.Json;

namespace LtiAdvantage.Utilities
{
    /// <summary>
    /// Extensions to make working with JWT Tokens easier.
    /// </summary>
    internal static class JwtExtensions
    {
        private static readonly JsonSerializerSettings Settings = new JsonSerializerSettings
        {
            NullValueHandling = NullValueHandling.Ignore
        };

        /// <summary>
        /// Get the payload claim value as a string.
        /// </summary>
        /// <returns>The claim value as a string.</returns>
        public static string GetClaimValue(this JwtPayload payload, string type)
        {
            return GetClaimValue<string>(payload, type);
        }

        /// <summary>
        /// Get the payload claim value as an object of type T.
        /// </summary>
        /// <typeparam name="T">The expected Type of the claim value.</typeparam>
        /// <param name="payload">The <see cref="JwtPayload"/> with the claim.</param>
        /// <param name="type">The claim type.</param>
        /// <returns>The claim value as an object of type T.</returns>
        public static T GetClaimValue<T>(this JwtPayload payload, string type)
        {
            if (typeof(T).IsArray)
            {
                return GetClaimValues<T>(payload, type);
            }

            if (payload.TryGetValue(type, out var value))
            {
                return typeof(T) == typeof(string)
                    ? JsonConvert.DeserializeObject<T>($"\"{value}\"")
                    : JsonConvert.DeserializeObject<T>(value.ToString());
            }

            return default(T);
        }

        private static T GetClaimValues<T>(this JwtPayload payload, string type)
        {
            var values = payload.Claims
                .Where(c => c.Type == type)
                .Select(c => c.Value).ToArray();

            var elementType = typeof(T).GetElementType();
            if (elementType != null && elementType.IsClass)
            {
                return JsonConvert.DeserializeObject<T>("[" + string.Join(",", values) + "]");
            }
            return JsonConvert.DeserializeObject<T>("[\"" + string.Join("\",\"", values) + "\"]");
        }

        public static void SetClaimValue<T>(this JwtPayload payload, string type, T value)
        {
            if (payload.ContainsKey(type))
            {
                payload.Remove(type);
            }

            if (typeof(T) == typeof(string))
            {
                var stringValue = value?.ToString();
                if (!string.IsNullOrWhiteSpace(stringValue))
                {
                    payload.AddClaim(new Claim(type, stringValue, ClaimValueTypes.String));
                }
            } 
            else if (typeof(T) == typeof(int))
            {
                payload.AddClaim(new Claim(type, value.ToString(), ClaimValueTypes.Integer));
            }
            else if (typeof(T).IsArray)
            {
                payload.AddClaim(new Claim(type, JsonConvert.SerializeObject(value, Settings), JsonClaimValueTypes.JsonArray));
            }
            else
            {
                var json = JsonConvert.SerializeObject(value, Settings);
                payload.AddClaim(new Claim(type, json, JsonClaimValueTypes.Json));
            }
        }
    }
}
