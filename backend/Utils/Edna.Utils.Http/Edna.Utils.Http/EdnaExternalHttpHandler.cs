using System.Net.Http;
using System.Security.Cryptography.X509Certificates;
using System.Net.Security;

namespace Edna.Utils.Http
{
    public class EdnaExternalHttpHandler: HttpClientHandler
    {
        public static string Name = nameof(EdnaHttpHandler);
        public EdnaExternalHttpHandler() : base()
        {
            ServerCertificateCustomValidationCallback = PerformX509Valiation;
        }

        public bool PerformX509Valiation ( HttpRequestMessage req, X509Certificate2 cert, X509Chain chain, SslPolicyErrors err )
        {
            return (err == SslPolicyErrors.None) && chain.Build(cert);
        }
    }
}
