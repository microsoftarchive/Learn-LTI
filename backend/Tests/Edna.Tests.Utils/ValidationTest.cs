using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Threading.Tasks;
using Edna.Utils.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using NUnit.Framework;

namespace Edna.Tests.Utils
{
    public class ValidationTest
    {
        private string _issuer;
        private string _audience;
        private string _email = "test@example.com";
        private RsaSecurityKey _key;
        private DateTime _nbf, _exp;
        private OpenIdConnectConfiguration _b2CConfig, _adConfig;
        private MockConfigurationManager<OpenIdConnectConfiguration> _b2CManager, _adManager;
        
        [SetUp]
        public void Setup()
        {
            _issuer = Guid.NewGuid().ToString();
            _audience = "https://testb2ctenant.b2clogin.com/" + Guid.NewGuid() + "/v2.0/";
            _key = new RsaSecurityKey(RSA.Create(2048));
            _nbf = DateTime.Now;
            _exp = _nbf.Add(new TimeSpan(0, 1, 0, 0));
            _b2CConfig = new OpenIdConnectConfiguration { Issuer = _issuer };
            _b2CConfig.SigningKeys.Add(_key);
            _adConfig = new OpenIdConnectConfiguration { Issuer = _issuer };
            _adConfig.SigningKeys.Add(_key);
            _b2CManager = new MockConfigurationManager<OpenIdConnectConfiguration>(_b2CConfig);
            _adManager = new MockConfigurationManager<OpenIdConnectConfiguration>(_adConfig);
        }

        // Test the token validation process by creating, signing and validating a token
        [Test]
        public async Task TestTokenValidation()
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Email, _email),
            };
            var signingKeys = new SigningCredentials(_key, SecurityAlgorithms.RsaSha256);
            var token = new JwtSecurityTokenHandler().WriteToken(new JwtSecurityToken(_issuer, _audience, claims, _nbf, _exp, signingKeys));
            var headers = new HeaderDictionary { { "Authorization", "bearer " + token } };
            Assert.IsTrue(await headers.ValidateToken(_b2CManager, _adManager, _audience));
        }

        // Test TryGetUserEmails method when passing a B2C token. Emails should be retrieved from the token.
        [Test]
        public void TestB2CValidatePermission()
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Email, _email),
                new Claim("_isB2CToken", "true"),
            };
            var signingKeys = new SigningCredentials(_key, SecurityAlgorithms.RsaSha256);
            var token = new JwtSecurityTokenHandler().WriteToken(new JwtSecurityToken(_issuer, _audience, claims, _nbf, _exp, signingKeys));
            var headers = new HeaderDictionary { { "Authorization", "bearer " + token } };
            Assert.IsTrue(headers.TryGetUserEmails(out List<string> userEmails));
            Assert.GreaterOrEqual(userEmails.Count, 1);
        }

        // Test TryGetUserEmails method when passing an AD token from user function calls. Emails should be retrieved from the token.
        [Test]
        public void TestAdUserValidatePermission()
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Email, _email),
                new Claim("azpacr", "0")
            };
            var signingKeys = new SigningCredentials(_key, SecurityAlgorithms.RsaSha256);
            var token = new JwtSecurityTokenHandler().WriteToken(new JwtSecurityToken(_issuer, _audience, claims, _nbf, _exp, signingKeys));
            var headers = new HeaderDictionary { { "Authorization", "bearer " + token } };
            Assert.IsTrue(headers.TryGetUserEmails(out List<string> userEmails));
            Assert.GreaterOrEqual(userEmails.Count, 1);
        }
        
        // Test TryGetUserEmails method when passing an AD token from system function calls. No email should be retrieved from the token.
        [Test]
        public void TestAdSystemValidatePermission()
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Email, _email),
                new Claim("azpacr", "2")
            };
            var signingKeys = new SigningCredentials(_key, SecurityAlgorithms.RsaSha256);
            var token = new JwtSecurityTokenHandler().WriteToken(new JwtSecurityToken(_issuer, _audience, claims, _nbf, _exp, signingKeys));
            var headers = new HeaderDictionary { { "Authorization", "bearer " + token } };
            Assert.IsTrue(headers.TryGetUserEmails(out List<string> userEmails));
            Assert.IsTrue(userEmails.Count == 0);
        }
    }
}