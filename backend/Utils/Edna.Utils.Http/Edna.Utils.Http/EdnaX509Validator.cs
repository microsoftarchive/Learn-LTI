using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using System.Text;

namespace Edna.Utils.Http
{
    public class EdnaX509Validator
    {
        public bool PerformX509Valiation 
         (
            HttpRequestMessage req,
            System.Security.Cryptography.X509Certificates.X509Certificate2 cert2,
            System.Security.Cryptography.X509Certificates.X509Chain chain,
            System.Net.Security.SslPolicyErrors err
         )
        {
            bool isNotExpierd = System.DateTime.Parse(cert2.GetExpirationDateString()) > System.DateTime.Now;
            bool isChainVerified = chain.Build(cert2);
            bool hasValidPublicKeySize = cert2.PublicKey.Key.KeySize >= 2048;

            var keyUsages = cert2.Extensions.OfType<X509KeyUsageExtension>().ToList();
            var enhancedUsages = cert2.Extensions.OfType<X509EnhancedKeyUsageExtension>().First().EnhancedKeyUsages;
            bool userForServerAuth = keyUsages.FirstOrDefault(item => item.Oid.FriendlyName == "Server Authentication") != null;

            foreach (Oid oid in enhancedUsages)
            {
                if (oid.FriendlyName == "Server Authentication")
                {
                    userForServerAuth = true;
                }
            }

            //var signAlgo = cert2.SignatureAlgorithm;            
            //var hostName = cert2.GetNameInfo(X509NameType.DnsName, false);
            //var chainStatus = chain.ChainStatus;   

            return isNotExpierd && isChainVerified && hasValidPublicKeySize && userForServerAuth;

            //TODO:
            // Domain name
            // Validity beginning date)
            // Revocation status
            // Hashing algorithm must be SHA256 and above

        }
    }
}
