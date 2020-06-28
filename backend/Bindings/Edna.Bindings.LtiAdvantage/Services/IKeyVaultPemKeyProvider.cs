using System.Threading.Tasks;

namespace Edna.Bindings.LtiAdvantage.Services
{
    public interface IKeyVaultPemKeyProvider
    {
        Task<string> GetPemKey(string keyVaultIdentifier);
    }
}