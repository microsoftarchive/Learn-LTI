using IdentityModel.Client;

namespace LtiAdvantage.IdentityModel.Client
{
    /// <inheritdoc />
    /// <summary>
    /// Request for token using signed jwt as client_credentials.
    /// </summary>
    /// <seealso cref="T:IdentityModel.Client.ClientCredentialsTokenRequest" />
    public class JwtClientCredentialsTokenRequest : ClientCredentialsTokenRequest
    {
        /// <summary>
        /// Gets or sets the JWT.
        /// </summary>
        /// <value>
        /// The JWT.
        /// </value>
        public string Jwt { get; set; }
    }
}
