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
  console.log('calling Axios basic initilializer');
  const request = {
    scopes: ['https://ltimoodleb2c.onmicrosoft.com/api/b2c.read', 'profile', 'openid'],
    account: accounts[0]
  };

  useEffect(() => {
    instance
      .acquireTokenSilent(request)
      .then(tokenObj => {
        console.log('set axios header from silent');
        axios.defaults.headers.common = { Authorization: `bearer ${tokenObj.accessToken}` };
        setAccessToken(tokenObj.accessToken);
        setIsTokenLoaded(true);
      })
      .catch(error => {
        console.log('axios get a popup instead ');
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

  return <>{isTokenLoaded ? children : null}</>;
};

async function useAccessToken() {
  const { instance, accounts } = useMsal();
  const [accessToken, setAccessToken] = useState(null);

  if (accounts.length > 0) {
    const request = {
      scopes: ['b2c.Read', 'profile', 'openid'],
      account: accounts[0]
    };
    instance
      .acquireTokenSilent(request)
      .then(response => {
        //setAccessToken(response.accessToken);
        return response.accessToken;
      })
      .catch(error => {
        // acquireTokenSilent can fail for a number of reasons, fallback to interaction
        if (error instanceof InteractionRequiredAuthError) {
          instance.acquireTokenPopup(request).then(response => {
            // setAccessToken(response.accessToken);
            return response.accessToken;
          });
        }
      });
  }

  return null;
}
// useEffect(() => {
//   instance
//     .acquireTokenSilent(request)
//     .then(tokenObj => {
//       console.log('set axios header from silent');
//       axios.defaults.headers.common = { Authorization: `bearer ${tokenObj}` };
//       //setAccessToken(tokenObj.accessToken);
//     })
//     .then(() =>
//       setIsTokenLoaded(true))
//     .catch(error => {
//       // acquireTokenSilent can fail for a number of reasons, fallback to interaction
//       if (error instanceof InteractionRequiredAuthError) {
//         instance.acquireTokenPopup(request).then((response) => {
//           // setAccessToken(response.accessToken);
//           return response.accessToken;
//         });
//       }
//     })
//     .then(() => {
//       setIsTokenLoaded(true);
//     });
//   axios.defaults.validateStatus = () => true;
// }, []);
