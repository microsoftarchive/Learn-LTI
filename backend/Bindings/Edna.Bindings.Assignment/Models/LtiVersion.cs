// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using System;

namespace Edna.Bindings.Assignment.Models
{
    
    public static class LtiVersionClass
    {
        public enum LtiVersion
        {
            Lti1,
            LtiAdvantage
        }

        public static string GetLtiVersion(string ltiRequestVersion, Action<string> logAction = null)
        {
            switch (ltiRequestVersion)
            {
                case "1.0":
                    return LtiVersion.Lti1.ToString();
                case "1.3.0":
                    return LtiVersion.LtiAdvantage.ToString();
                default:
                    logAction?.Invoke($"Unexpected Lti Version- {ltiRequestVersion}");
                    return null;
            }
        }
    }
}