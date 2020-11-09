using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;

namespace Edna.Bindings.LtiAdvantage.Utils
{
    public static class EdnaExternalHttpClient
    {
        public static HttpClient Create()
        {
            return new HttpClient(new EdnaExternalHttpHandler());
        }
    }
}
