/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { MsalAuthProvider, LoginType, IMsalAuthProviderConfig } from 'react-aad-msal';
import { Configuration, Logger, LogLevel, AuthenticationParameters } from 'msal';
import { b2cPolicies } from './policies';

const authLogCallback = (level: LogLevel, message: string, _containsPii: boolean): void => {
  // Not setting the log at all, will cause the an exception in the UserAgentApplication.
  // Originally, the NODE_ENV check was in the setting of the logger.
  if (process.env.NODE_ENV === 'development') {
    console.info('AUTH MESSAGE: ', message);
  }
};

const configuration: Configuration = {
  auth: {
    clientId: 'e5642ae2-5178-4b6f-9653-d80f6f47fcf0', // RB: don't hardcode
    redirectUri: process.env.REACT_APP_EDNA_MAIN_URL!,
    authority: b2cPolicies.authorities.signUpSignIn.authority,
    navigateToLoginRequestUrl: true,
    knownAuthorities: [b2cPolicies.authorityDomain]
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: true
  },
  system: {
    logger: new Logger(authLogCallback)
  }
};

const authParams: AuthenticationParameters = {
  scopes: ['https://uclmscltib2c.onmicrosoft.com/e5642ae2-5178-4b6f-9653-d80f6f47fcf0/demo.read'] // RB: configure B2C here
};

const options: IMsalAuthProviderConfig = {
  loginType: LoginType.Redirect
};

export const AppAuthConfig = new MsalAuthProvider(configuration, authParams, options);
