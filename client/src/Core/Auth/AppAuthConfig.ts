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
    clientId: '0cd1d1d6-a7aa-41e2-b569-1ca211147973', // RB: don't hardcode
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
  scopes: ['https://ltimoodleb2c.onmicrosoft.com/api/b2c.read'] // RB: configure B2C here
};

const options: IMsalAuthProviderConfig = {
  loginType: LoginType.Redirect
};

export const AppAuthConfig = new MsalAuthProvider(configuration, authParams, options);
