using System;
using System.Threading.Tasks;
using Edna.Bindings.LtiAdvantage.Attributes;
using Edna.Bindings.LtiAdvantage.Models;
using Edna.Bindings.LtiAdvantage.Services;
using Microsoft.Azure.WebJobs.Host.Bindings;
using Microsoft.Azure.WebJobs.Host.Config;

namespace Edna.Bindings.LtiAdvantage.BindingConfigurations
{
    public class LtiAdvantageExtensionConfigProvider : IExtensionConfigProvider
    {
        private readonly NrpsClient.NrpsClientFactory _nrpsClientFactory;
        private readonly IKeyVaultPemKeyProvider _keyVaultPemKeyProvider;

        public LtiAdvantageExtensionConfigProvider(NrpsClient.NrpsClientFactory nrpsClientFactory, IKeyVaultPemKeyProvider keyVaultPemKeyProvider)
        {
            _nrpsClientFactory = nrpsClientFactory;
            _keyVaultPemKeyProvider = keyVaultPemKeyProvider;
        }

        public void Initialize(ExtensionConfigContext context)
        {
            var binding = context.AddBindingRule<LtiAdvantageAttribute>();
            binding.BindToInput(attribute => (INrpsClient)_nrpsClientFactory.Create(attribute.KeyVaultKeyIdentifier));
            binding.BindToInput(ConvertToPublicKey);

            binding.Bind(new LtiAdvantageBindingProvider());
        }

        private async Task<LtiToolPublicKey> ConvertToPublicKey(LtiAdvantageAttribute ltiAdvantageAttribute, ValueBindingContext context)
        {
            string keyVaultKeyIdentifier = ltiAdvantageAttribute.KeyVaultKeyIdentifier;
            if (string.IsNullOrEmpty(keyVaultKeyIdentifier))
                throw new Exception("KeyVaultIdentifier was not set properly.");

            string pemKey = await _keyVaultPemKeyProvider.GetPemKey(keyVaultKeyIdentifier);

            return new LtiToolPublicKey(pemKey);
        }
    }
}