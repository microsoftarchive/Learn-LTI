// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using Edna.Utils.Http;
using IdentityModel;
using IdentityModel.Client;
using LtiAdvantage.IdentityModel.Client;
using Microsoft.Azure.Services.AppAuthentication;
using Microsoft.IdentityModel.KeyVaultExtensions;
using Microsoft.IdentityModel.Tokens;

namespace Edna.Bindings.LtiAdvantage.Services
{
    internal class AccessTokenService : IAccessTokenService
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public AccessTokenService(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        public async Task<TokenResponse> GetAccessTokenAsync(string clientId, string accessTokenEndpoint, string scope, string keyVaultKeyString)
        {
            TokenResponse errorResponse = ValidateParameters((nameof(clientId), clientId), (nameof(accessTokenEndpoint), accessTokenEndpoint), (nameof(scope), scope), (nameof(keyVaultKeyString), keyVaultKeyString));
            if (errorResponse != null)
                return errorResponse;
            
            // Use a signed JWT as client credentials.
            var payload = new JwtPayload();
            payload.AddClaim(new Claim(JwtRegisteredClaimNames.Iss, clientId));
            payload.AddClaim(new Claim(JwtRegisteredClaimNames.Sub, clientId));
            payload.AddClaim(new Claim(JwtRegisteredClaimNames.Aud, accessTokenEndpoint));
            payload.AddClaim(new Claim(JwtRegisteredClaimNames.Iat, EpochTime.GetIntDate(DateTime.UtcNow).ToString(), ClaimValueTypes.Integer64));
            payload.AddClaim(new Claim(JwtRegisteredClaimNames.Nbf, EpochTime.GetIntDate(DateTime.UtcNow.AddSeconds(-5)).ToString(), ClaimValueTypes.Integer64));
            payload.AddClaim(new Claim(JwtRegisteredClaimNames.Exp, EpochTime.GetIntDate(DateTime.UtcNow.AddMinutes(5)).ToString(), ClaimValueTypes.Integer64));
            payload.AddClaim(new Claim(JwtRegisteredClaimNames.Jti, CryptoRandom.CreateUniqueId()));

            var handler = new JwtSecurityTokenHandler();
            var credentials = GetSigningCredentialsFromKeyVault(keyVaultKeyString);
            var jwt = handler.WriteToken(new JwtSecurityToken(new JwtHeader(credentials), payload));

            var request = new JwtClientCredentialsTokenRequest { Address = accessTokenEndpoint, ClientId = clientId, Jwt = jwt, Scope = scope };

            return await _httpClientFactory
                .CreateClient(EdnaExternalHttpHandler.Name)
                .RequestClientCredentialsTokenWithJwtAsync(request);
        }

        private SigningCredentials GetSigningCredentialsFromKeyVault(string keyVaultKeyString)
        {
            AzureServiceTokenProvider azureServiceTokenProvider = new AzureServiceTokenProvider();
            KeyVaultSecurityKey.AuthenticationCallback keyVaultAuthCallback = new KeyVaultSecurityKey.AuthenticationCallback(azureServiceTokenProvider.KeyVaultTokenCallback);
            KeyVaultSecurityKey keyVaultSecurityKey = new KeyVaultSecurityKey(keyVaultKeyString, keyVaultAuthCallback);
            CryptoProviderFactory cryptoProviderFactory = new CryptoProviderFactory { CustomCryptoProvider = new KeyVaultCryptoProvider() };

            return new SigningCredentials(keyVaultSecurityKey, SecurityAlgorithms.RsaSha256) { CryptoProviderFactory = cryptoProviderFactory };
        }

        private TokenResponse ValidateParameters(params (string paramName, string value)[] parametersToValidate)
        {
            if (parametersToValidate == null || parametersToValidate.Length == 0)
                return null;

            return parametersToValidate
                .Where(pair => string.IsNullOrWhiteSpace(pair.value))
                .Select(pair => ProtocolResponse.FromException<TokenResponse>(new ArgumentNullException(pair.paramName)))
                .FirstOrDefault();
        }
    }
}