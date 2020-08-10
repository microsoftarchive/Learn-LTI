using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using IdentityModel.Jwk;
using Microsoft.Azure.KeyVault;
using Microsoft.Azure.KeyVault.Models;
using Microsoft.Azure.Services.AppAuthentication;
using Microsoft.IdentityModel.KeyVaultExtensions;

namespace Edna.Bindings.LtiAdvantage.Services
{
    internal class KeyVaultJwkProvider : IKeyVaultJwkProvider
    {
        public async Task<JsonWebKey> GetJwk(string keyVaultIdentifier)
        {
            AzureServiceTokenProvider azureServiceTokenProvider = new AzureServiceTokenProvider();
            KeyVaultSecurityKey.AuthenticationCallback keyVaultAuthCallback = new KeyVaultSecurityKey.AuthenticationCallback(azureServiceTokenProvider.KeyVaultTokenCallback);

            KeyVaultClient client = new KeyVaultClient(new KeyVaultClient.AuthenticationCallback(keyVaultAuthCallback));
            KeyBundle keyBundle = await client.GetKeyAsync(keyVaultIdentifier);

            var jwk = new JsonWebKey(keyBundle.Key.ToString());

            //Pruning to remove values for certian properties that are optional
            return (new JsonWebKey()
            {
                Kid = keyVaultIdentifier,
                Kty = JsonWebAlgorithmsKeyTypes.RSA,
                Alg = Microsoft.IdentityModel.Tokens.SecurityAlgorithms.RsaSha256,
                Use = Microsoft.IdentityModel.Tokens.JsonWebKeyUseNames.Sig,
                E = jwk.E,
                N = jwk.N
            });

        }
       
    }
}