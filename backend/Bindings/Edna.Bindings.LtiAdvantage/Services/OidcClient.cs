// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using System.Collections.Specialized;
using System.Web;
using Edna.Bindings.LtiAdvantage.Models;

namespace Edna.Bindings.LtiAdvantage.Services
{
    public class OidcClient
    {
        private readonly NameValueCollection _loginQueryParams;

        internal OidcClient(LoginParams loginParams)
        {
            _loginQueryParams = new NameValueCollection
            {
                ["response_type"] = "id_token",
                ["response_mode"] = "form_post",
                ["redirect_uri"] = loginParams.TargetLinkUri,
                ["scope"] = "openid",
                ["login_hint"] = loginParams.LoginHint,
                ["prompt"] = "none",
                ["lti_message_hint"] = loginParams.LtiMessageHint
            };
        }

        public NameValueCollection GetRedirectQueryParams(string clientId)
        {
            NameValueCollection httpCopiedValuesCollection = HttpUtility.ParseQueryString(string.Empty);
            httpCopiedValuesCollection.Add(_loginQueryParams);
            httpCopiedValuesCollection["client_id"] = clientId;

            return httpCopiedValuesCollection;
        }
    }
}