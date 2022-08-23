using System.Threading;
using System.Threading.Tasks;
using Microsoft.IdentityModel.Protocols;

namespace Edna.Tests.Utils
{
    public class MockConfigurationManager<T> : IConfigurationManager<T> where T : class
    {
        private T _configuration;

        public MockConfigurationManager(T configuration)
        {
            _configuration = configuration;
        }

        public async Task<T> GetConfigurationAsync(CancellationToken cancel)
        {
            await Task.Delay(10, cancel);
            return _configuration;
        }

        public void RequestRefresh() { }
    }
}