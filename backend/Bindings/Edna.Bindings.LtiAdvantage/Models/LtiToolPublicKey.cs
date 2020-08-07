namespace Edna.Bindings.LtiAdvantage.Models
{
    public class LtiToolPublicKey
    {
        public string PemString { get; }
		
        public string Jwk { get; }
		
        internal LtiToolPublicKey(string pemString, string jwk)
        {
            PemString = pemString;
            Jwk = jwk;
        }
    }
}