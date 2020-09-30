using Microsoft.Azure.WebJobs.Host.Config;

namespace Edna.Bindings.Lti1
{
    public class Lti1BindingConfigProvider : IExtensionConfigProvider
    {
        private readonly Lti1MembershipClient _lti1MembershipClient;

        public Lti1BindingConfigProvider(Lti1MembershipClient lti1MembershipClient)
        {
            _lti1MembershipClient = lti1MembershipClient;
        }

        public void Initialize(ExtensionConfigContext context)
        {
            var lti1BindingRule = context.AddBindingRule<Lti1Attribute>();

            lti1BindingRule.BindToInput(_ => _lti1MembershipClient);
        }
    }
}