using System;
using System.Linq;
using System.Net.Http;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using System.Net.Security;

namespace Edna.Utils.Http
{
    public class EdnaExternalHttpHandler: HttpClientHandler
    {
        public static string Name = nameof(EdnaHttpHandler);
        public EdnaExternalHttpHandler() : base()
        {
            ServerCertificateCustomValidationCallback += PerformX509Valiation;
        }

        // TODO:
        // Validate beginning date
        // Remove comments
        public bool PerformX509Valiation 
         (
            HttpRequestMessage req,
            X509Certificate2 cert2,
            X509Chain chain,
            SslPolicyErrors err
         )
        {
            const string SERVER_AUTH_CERTIFICATE_USAGE_VALUE = "Server Authentication";
            var disabledSignAlgos = new System.Collections.Generic.List<string>() { "sha1", "sha224" };

            try
            {
                bool noPolicyError = err == SslPolicyErrors.None; // checks for NameMismatch as well as chain errors, and also when the certificate was not found!
                bool isNotExpierd = DateTime.Parse(cert2.GetExpirationDateString()) > DateTime.Now; // Not expired
                bool isChainVerified = chain.Build(cert2); // Chain verification: can remove as already done by the policy
                bool hasValidPublicKeySize = cert2.PublicKey.Key.KeySize >= 2048; // key size permissible

                var keyUsages = cert2.Extensions.OfType<X509KeyUsageExtension>().ToList(); // certificate used for server auth
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

                var chainStatus = chain.ChainStatus; // chain status revokation: happens when there is some chain error: can remove as already done by policy
                bool chainIsNotRevoked = true;
                foreach (X509ChainStatus status in chainStatus)
                {
                    if (status.Status == X509ChainStatusFlags.Revoked)
                    {
                        chainIsNotRevoked = false;
                    }
                }

                var signAlgo = cert2.SignatureAlgorithm.FriendlyName; // check if signing algo is not supported (recommended: >= sha256).
                bool signAlgoIsEnabled = true;
                foreach (var algo in disabledSignAlgos)
                {
                    if (signAlgo.Contains(algo))
                    {
                        signAlgoIsEnabled = false;
                    }
                }

                bool serverCertificateIsValid = noPolicyError && isNotExpierd && isChainVerified && hasValidPublicKeySize && userForServerAuth && chainIsNotRevoked && signAlgoIsEnabled;
                return serverCertificateIsValid;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
    }
}
