/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import React, { PropsWithChildren, useState, useEffect } from 'react';
import axios from 'axios';
import { useMsal } from '@azure/msal-react';
import { InteractionRequiredAuthError, BrowserAuthError, InteractionStatus } from '@azure/msal-browser';
import { request } from './AppAuthConfig';

export const AxiosBasicAuthInitializer = ({ children }: PropsWithChildren<{}>): JSX.Element => {
  const { instance, accounts, inProgress } = useMsal();
  const [isTokenLoaded, setIsTokenLoaded] = useState(false);
  const [accessToken, setAccessToken] = useState<null | string>(null);

  // Called everytime time the LTI app is accessed to authenticate the user before allowing access.
  request.account = accounts[0];
  request.loginHint = request.account.username;
  // request.loginHint = request.account.
  useEffect(() => {
    if (!isTokenLoaded && inProgress === InteractionStatus.None) {
      instance
        .acquireTokenSilent(request)
        .then(tokenObj => {
          accounts[0].username = tokenObj.idTokenClaims['email'];
          axios.defaults.headers.common = { Authorization: `bearer ${tokenObj.accessToken}` };
          setAccessToken(tokenObj.accessToken);
          setIsTokenLoaded(true);
        })
        .catch(error => {
          console.log('silent failed');
          console.log(error);
          // acquireTokenSilent can fail for a number of reasons, fallback to interaction
          if (error instanceof InteractionRequiredAuthError || error instanceof BrowserAuthError) {
            instance.acquireTokenRedirect(request);
          }
        });
      axios.defaults.validateStatus = () => true;
    }
  }, [instance, accounts, inProgress, isTokenLoaded]);

  // Check if user has successfully been authenticated and load children(Children are basically anything that
  // is between the open and closing tag of this <AxiosBasicAuthInitialer> component), otherwise return null.
  return <>{isTokenLoaded ? children : null}</>;
};
