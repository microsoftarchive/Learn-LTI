using System.Threading.Tasks;
using LtiAdvantage.Lti;

namespace Edna.Bindings.LtiAdvantage.Services
{
    public interface ILtiResourceLinkRequestClient
    {
        Task<LtiResourceLinkRequest> GetLtiResourceLinkRequest(string jwkSetUrl, string clientId, string issuer);
    }
}