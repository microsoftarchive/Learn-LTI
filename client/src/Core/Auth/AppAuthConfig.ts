/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

// import { MsalAuthProvider, LoginType, IMsalAuthProviderConfig } from 'react-aad-msal';
// import { AuthenticationParameters } from 'msal';
import { PublicClientApplication, Configuration, Logger, LogLevel } from '@azure/msal-browser';

import { b2cPolicies } from './policies';

const authLogCallback = (level: LogLevel, message: string, _containsPii: boolean): void => {
  // Not setting the log at all, will cause the an exception in the UserAgentApplication.
  // Originally, the NODE_ENV check was in the setting of the logger.
  if (process.env.NODE_ENV === 'development') {
    console.info('AUTH MESSAGE: ', message);
  }
};

const config: Configuration = {
  auth: {
    // clientId: process.env.REACT_APP_EDNA_AUTH_CLIENT_ID!, //process.env.REACT_APP_EDNA_AAD_CLIENT_ID!
    clientId: '0cd1d1d6-a7aa-41e2-b569-1ca211147973', // TODO: don't hardcode
    redirectUri: process.env.REACT_APP_EDNA_MAIN_URL!,
    authority: b2cPolicies.authorities.signIn.authority,
    navigateToLoginRequestUrl: true,
    knownAuthorities: [b2cPolicies.authorityDomain]
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: true
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
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
        }
      },
      piiLoggingEnabled: false
    },
    allowRedirectInIframe: true
  }
};

// Todo, may no longer be neccessary
// const authParams: AuthenticationParameters = {
//   //scopes: ['https://' + process.env.REACT_APP_EDNA_B2C_TENANT! + '.onmicrosoft.com/api/b2c.read'] // RB: 'https://ltimoodleb2c.onmicrosoft.com/api/b2c.read'
//   scopes: [
//     // TODO: unclear what is needed for custom policies
//     //'https://ltimoodleb2c.onmicrosoft.com/api/user_impersonation',
//     'https://ltimoodleb2c.onmicrosoft.com/api/b2c.read',
//     'openid',
//     'profile'
//   ]
// };

// Todo, may no longer be neccessary
// const options: IMsalAuthProviderConfig = {
//   loginType: LoginType.Redirect,

// };

//export const AppAuthConfig = new MsalAuthProvider(configuration, authParams, options);

export const AppAuthConfig = new PublicClientApplication(config);
