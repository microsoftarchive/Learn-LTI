using IdentityModel.Jwk;
using System.Threading.Tasks;

namespace Edna.Bindings.LtiAdvantage.Services
{
    public interface IKeyVaultJwkProvider
    {
        Task<JsonWebKey> GetJwk(string keyVaultIdentifier);
    }
}