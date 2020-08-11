using System;
using System.Collections;
using System.Reflection;
using LtiAdvantage.Utilities;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace LtiAdvantage.Lti
{
    internal class RoleConverter : StringEnumConverter
    {
        private static readonly Hashtable Roles;
        static RoleConverter()
        {
            Roles = GetUris(typeof(Role));
        }

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            if (reader.TokenType == JsonToken.Null)
            {
                return base.ReadJson(reader, objectType, existingValue, serializer);
            }

            if (!objectType.GetTypeInfo().IsAssignableFrom(typeof(Role)))
            {
                return base.ReadJson(reader, objectType, existingValue, serializer);
            }

            if (reader.TokenType != JsonToken.String)
            {
                return base.ReadJson(reader, objectType, existingValue, serializer);
            }

            var value = reader.Value.ToString();
            if (Roles.ContainsKey(value))
            {
                var role = (Role) Roles[value];
                return role;
            }

            return Role.Unknown;
        }

        private static Hashtable GetUris(Type type)
        {
            var roles = new Hashtable();
            foreach (Enum value in Enum.GetValues(type))
            {
                var uris = value.GetUris();
                if (uris != null && uris.Length > 0)
                {
                    foreach (var uri in uris)
                    {
                        roles.Add(uri, value);
                        // Only map the Enum back to the full URI
                        if (uri.StartsWith("http"))
                        {
                            roles.Add(value, uri);
                        }
                    }
                }
            }

            return roles;
        }

        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            if (value == null)
            {
                base.WriteJson(writer, null, serializer);
                return;
            }

            if (Roles.ContainsKey(value))
            {
                var uri = Roles[value];
                writer.WriteValue(uri);
                return;
            }

            base.WriteJson(writer, value, serializer);
        }
    }
}
