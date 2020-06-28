namespace Edna.Bindings.LtiAdvantage.Models
{
    public class LtiToolPublicKey
    {
        public string PemString { get; }

        internal LtiToolPublicKey(string pemString)
        {
            PemString = pemString;
        }
    }
}