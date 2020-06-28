using System.Threading.Tasks;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.DurableTask;
using Newtonsoft.Json;

namespace Edna.Connect
{
    [JsonObject(MemberSerialization.OptIn)]
    public class Nonce
    {
        [JsonProperty("state")]
        public string State { get; set; }

        public void SetState(string state) => State = state;
        public void Delete() => Entity.Current.DeleteState();

        [FunctionName(nameof(Nonce))]
        public static Task Run([EntityTrigger] IDurableEntityContext ctx) => ctx.DispatchAsync<Nonce>();
    }
}