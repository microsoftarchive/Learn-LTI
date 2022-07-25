/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import React, { PropsWithChildren, useState, useEffect } from 'react';
import axios from 'axios';
import { useMsal } from '@azure/msal-react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';

export const AxiosBasicAuthInitializer = ({ children }: PropsWithChildren<{}>): JSX.Element => {
  const { instance, accounts } = useMsal();
  const [isTokenLoaded, setIsTokenLoaded] = useState(false);
  const [accessToken, setAccessToken] = useState<null | string>(null);
  const request = {
    scopes: ['https://ltimoodleb2c.onmicrosoft.com/api/b2c.read', 'profile', 'openid'],
    account: accounts[0]
  };

  // Called everytime time the LTI app is accessed to authenticate the user before allowing access.

  useEffect(() => {
    instance
      .acquireTokenSilent(request)
      .then(tokenObj => {
        axios.defaults.headers.common = { Authorization: `bearer ${tokenObj.accessToken}` };
        setAccessToken(tokenObj.accessToken);
        setIsTokenLoaded(true);
      })
      .catch(error => {
        // acquireTokenSilent can fail for a number of reasons, fallback to interaction
        if (error instanceof InteractionRequiredAuthError) {
          instance.acquireTokenPopup(request).then(response => {
            setAccessToken(response.accessToken);
            return response.accessToken;
          });
        }
      });
    axios.defaults.validateStatus = () => true;
  }, []);

  // Check if user has successfully been authenticated and load children(Children are basically anything that
  // is between the open and closing tag of this <AxiosBasicAuthInitialer> component), otherwise return null.
  return <>{isTokenLoaded ? children : null}</>;
};
