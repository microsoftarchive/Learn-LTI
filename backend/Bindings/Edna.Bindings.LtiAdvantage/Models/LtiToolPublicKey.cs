using IdentityModel.Jwk;

namespace Edna.Bindings.LtiAdvantage.Models
{
    public class LtiToolPublicKey
    {
        public string PemString { get; }
		
        public JsonWebKey Jwk { get; }
		
        internal LtiToolPublicKey(string pemString, JsonWebKey jwk)
        {
            PemString = pemString;
            Jwk = jwk;
        }
    }
}