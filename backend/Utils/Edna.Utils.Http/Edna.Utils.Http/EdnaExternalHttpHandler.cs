using System;
using System.Linq;
using System.Net.Http;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using System.Net.Security;
using System.Text.RegularExpressions;

namespace Edna.Utils.Http
{
    public class EdnaExternalHttpHandler: HttpClientHandler
    {
        public static string Name = nameof(EdnaHttpHandler);
        public EdnaExternalHttpHandler() : base()
        {
            ServerCertificateCustomValidationCallback += PerformX509Valiation;
        }

        public bool PerformX509Valiation 
         (
            HttpRequestMessage req,
            X509Certificate2 cert2,
            X509Chain chain,
            SslPolicyErrors err
         )
        {
            const string SERVER_AUTH_CERTIFICATE_USAGE_VALUE = "Server Authentication";

            try
            {
                bool noPolicyError = err == SslPolicyErrors.None;
                bool isNotExpierd = DateTime.Parse(cert2.GetExpirationDateString()) > System.DateTime.Now;
                bool isChainVerified = chain.Build(cert2);
                bool hasValidPublicKeySize = cert2.PublicKey.Key.KeySize >= 2048;

                var keyUsages = cert2.Extensions.OfType<X509KeyUsageExtension>().ToList();
                bool userForServerAuth = keyUsages.FirstOrDefault(item => item.Oid.FriendlyName == SERVER_AUTH_CERTIFICATE_USAGE_VALUE) != null;
                if (!userForServerAuth)
                {
                    var enhancedUsages = cert2.Extensions.OfType<X509EnhancedKeyUsageExtension>().First().EnhancedKeyUsages;
                    foreach (Oid oid in enhancedUsages)
                    {
                        if (oid.FriendlyName == SERVER_AUTH_CERTIFICATE_USAGE_VALUE)
                        {
                            userForServerAuth = true;
                        }
                    }
                }

                var chainStatus = chain.ChainStatus;
                bool chainIsNotRevoked = true;
                foreach (X509ChainStatus status in chainStatus)
                {
                    if (status.Status == X509ChainStatusFlags.Revoked)
                    {
                        chainIsNotRevoked = false;
                    }
                }

                // TODO: Match domain name against hostname properly
                //var certDnsName = cert2.GetNameInfo(X509NameType.DnsName, false);
                //Regex rg = new Regex(@certDnsName);
                //bool hostNameMached = rg.IsMatch(req.RequestUri.Host);

                Oid signAlgo = cert2.SignatureAlgorithm;

                return noPolicyError && isNotExpierd && isChainVerified && hasValidPublicKeySize && userForServerAuth && chainIsNotRevoked;
            }
            catch (Exception e)
            {
                throw e;
            }

            //TODO:
            // Domain name
            // Validity beginning date
            // Hashing algorithm must be SHA256 and above

        }
    }
}
