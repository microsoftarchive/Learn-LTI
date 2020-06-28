import { MsalAuthProvider, LoginType, IMsalAuthProviderConfig } from 'react-aad-msal';
import { Configuration, Logger, LogLevel, AuthenticationParameters } from 'msal';

const authLogCallback = (level: LogLevel, message: string, _containsPii: boolean): void => {
  // Not setting the log at all, will cause the an exception in the UserAgentApplication.
  // Originally, the NODE_ENV check was in the setting of the logger.
  if (process.env.NODE_ENV === 'development') {
    console.info('AUTH MESSAGE: ', message);
  }
};

const configuration: Configuration = {
  auth: {
    clientId: process.env.REACT_APP_EDNA_AAD_CLIENT_ID!,
    redirectUri: process.env.REACT_APP_EDNA_MAIN_URL!,
    authority: `https://login.microsoftonline.com/${process.env.REACT_APP_EDNA_TENANT_ID}`,
    navigateToLoginRequestUrl: true
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
  scopes: [process.env.REACT_APP_EDNA_DEFAULT_SCOPE!]
};

const options: IMsalAuthProviderConfig = {
  loginType: LoginType.Redirect
};

export const AppAuthConfig = new MsalAuthProvider(configuration, authParams, options);
