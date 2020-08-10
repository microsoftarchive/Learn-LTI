using System;
using System.Collections.Specialized;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using Edna.Bindings.Assignment.Attributes;
using Edna.Bindings.Assignment.Models;
using Edna.Bindings.LtiAdvantage.Attributes;
using Edna.Bindings.LtiAdvantage.Models;
using Edna.Bindings.LtiAdvantage.Services;
using Edna.Bindings.Platform.Attributes;
using Edna.Bindings.Platform.Models;
using IdentityModel.Jwk;
using LtiAdvantage.Lti;
using LtiAdvantage.NamesRoleProvisioningService;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.DurableTask;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;

namespace Edna.Connect
{
    public class JwksApi
    {

        private readonly ILogger<LtiAdvantageApi> _logger;

        public JwksApi(ILogger<LtiAdvantageApi> logger)
        {
            _logger = logger;
        }

        [FunctionName(nameof(Jwks))]
        public IActionResult Jwks(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "jwks/{platformId}")] HttpRequest req,
            [LtiAdvantage] LtiToolPublicKey publicKey
)
        {
            var jwks = new JsonWebKeySet();
            jwks.Keys.Add(publicKey.Jwk);
            return new OkObjectResult(jwks);

        }

    }
}