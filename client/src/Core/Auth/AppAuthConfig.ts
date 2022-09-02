/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

// import { MsalAuthProvider, LoginType, IMsalAuthProviderConfig } from 'react-aad-msal';
// import { AuthenticationParameters } from 'msal';
import { PublicClientApplication, Configuration, Logger, LogLevel } from '@azure/msal-browser';

import { b2cPolicies } from './policies';

export let request;
let authority;
// Swap out needed B2C vs AD options
if (process.env.REACT_APP_EDNA_B2C_TENANT! != 'NA') {
  request = {
    scopes: [
      'openid',
      'profile',
      'https://' +
        process.env.REACT_APP_EDNA_B2C_TENANT! +
        '.onmicrosoft.com/' +
        process.env.REACT_APP_EDNA_B2C_CLIENT_ID +
        '/b2c.read'
    ]
  };
  authority = b2cPolicies.authorities.signIn.authority;
} else {
  request = {
    scopes: [process.env.REACT_APP_EDNA_DEFAULT_SCOPE!, 'email', 'profile', 'openid', 'User.Read']
  };
  authority = `https://login.microsoftonline.com/${process.env.REACT_APP_EDNA_TENANT_ID}`;
}

const authLogCallback = (level: LogLevel, message: string, _containsPii: boolean): void => {
  // Not setting the log at all, will cause the an exception in the UserAgentApplication.
  // Originally, the NODE_ENV check was in the setting of the logger.
  if (process.env.NODE_ENV === 'development') {
    console.info('AUTH MESSAGE: ', message);
  }
};

const config: Configuration = {
  auth: {
    clientId: process.env.REACT_APP_EDNA_AUTH_CLIENT_ID!, //process.env.REACT_APP_EDNA_AAD_CLIENT_ID!
    redirectUri: process.env.REACT_APP_EDNA_MAIN_URL!,
    authority: authority,
    navigateToLoginRequestUrl: true,
    knownAuthorities: [b2cPolicies.authorityDomain]
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: LogLevel, message: string, containsPii: boolean): void => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            return;
          case LogLevel.Verbose:
            return;
          case LogLevel.Warning:
            return;
        }
      },
      piiLoggingEnabled: false
    },
    allowRedirectInIframe: true
  }
};

export const AppAuthConfig = new PublicClientApplication(config);
