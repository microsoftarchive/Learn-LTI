/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import React from 'react';
import { useState } from 'react';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';
import { RootStore } from './Stores/Root.store';
import { StoreProvider } from './Stores/Core';
import { MainLayout } from './Core/Components/MainLayout';
import { GlobalRouter } from './Router/GlobalRouter';
import { registerIcons, loadTheme } from '@uifabric/styling';
import { fabricIconsData } from './Assets/Fonts/FabricIconsData';
import { AppAuthConfig } from './Core/Auth/AppAuthConfig';
import { initializeIcons } from '@fluentui/react';
import { appTheme } from './Core/Themes/MainTheme';
import { PlatformPage } from './Features/Platform/PlatformPage';
import { PublicClientApplication, InteractionType, InteractionRequiredAuthError } from '@azure/msal-browser';
import {
  MsalAuthenticationTemplate,
  MsalProvider,
  useMsal,
  useIsAuthenticated,
  useMsalAuthentication
} from '@azure/msal-react';
import { AxiosBasicAuthInitializer } from './Core/Auth/AxiosBasicAuthInitializer';

const rootStore: RootStore = new RootStore();
AppAuthConfig;

function App() {
  registerIcons(fabricIconsData);
  initializeIcons();
  loadTheme(appTheme);
  const request = {
    scopes: ['openid', 'profile', 'https://ltimoodleb2c.onmicrosoft.com/api/b2c.read']
  };

  //CreateInterceptor();

  return (
    <BrowserRouter>
      <MsalProvider instance={AppAuthConfig}>
        <MsalAuthenticationTemplate interactionType={InteractionType.Popup} authenticationRequest={request}>
          <AxiosBasicAuthInitializer>
            <StoreProvider rootStore={rootStore}>
              <GlobalRouter
                AssignmentRouteComponent={<MainLayout />}
                PlatformRegistrationComponent={<PlatformPage />}
              />
            </StoreProvider>
          </AxiosBasicAuthInitializer>
        </MsalAuthenticationTemplate>
      </MsalProvider>
    </BrowserRouter>
  );
}

// return (
//   <BrowserRouter>
//     <AzureAD provider={AppAuthConfig} forceLogin={true}>
//       <AxiosBasicAuthInitializer>
//         <StoreProvider rootStore={rootStore}>
//           <GlobalRouter AssignmentRouteComponent={<MainLayout />} PlatformRegistrationComponent={<PlatformPage />} />
//         </StoreProvider>
//       </AxiosBasicAuthInitializer>
//     </AzureAD>
//   </BrowserRouter>
// );

function ExampleComponent() {
  const isAuthenticated = useIsAuthenticated();
  const { instance, accounts } = useMsal();
  const request = {
    scopes: ['openid', 'profile', 'https://ltimoodleb2c.onmicrosoft.com/api/b2c.read'],
    account: accounts[0]
  };
  const { error } = useMsalAuthentication(InteractionType.Redirect, request); // Will initiate a popup login if user is unauthenticated

  if (isAuthenticated) {
    return <span>Only authenticated users can see me.</span>;
  } else if (error) {
    return <span>An error occurred during login!</span>;
  } else {
    return <span>Only unauthenticated users can see me.</span>;
  }
}

function UseAccessToken() {
  const isAuthenticated = useIsAuthenticated();
  const { instance, accounts } = useMsal();
  const request = {
    scopes: ['openid', 'profile', 'https://ltimoodleb2c.onmicrosoft.com/api/b2c.read'],
    account: accounts[0]
  };
  const { error } = useMsalAuthentication(InteractionType.Redirect, request);
  console.log('In use access token');

  const [accessToken] = useState(null);

  if (accounts.length > 0) {
    instance
      .acquireTokenSilent(request)
      .then(response => {
        axios.defaults.headers.common = { Authorization: `bearer ${response.accessToken}` };
        //setAccessToken(response.accessToken);
        //setAccessToken(response.accessToken);
      })
      .catch(error => {
        // acquireTokenSilent can fail for a number of reasons, fallback to interaction
        if (error instanceof InteractionRequiredAuthError) {
          instance.acquireTokenPopup(request).then(response => {
            axios.defaults.headers.common = { Authorization: `bearer ${response.accessToken}` };
            //setAccessToken(response.accessToken);
          });
        }
      });
  }

  return accessToken;
}

function CreateInterceptor() {
  // Add a request interceptor
  const { instance, accounts } = useMsal();
  const request = {
    scopes: ['openid', 'profile', 'https://ltimoodleb2c.onmicrosoft.com/api/b2c.read'],
    account: accounts[0]
  };
  console.log('This has been intercepted mwahaha');

  axios.interceptors.request.use(config => {
    instance
      .acquireTokenSilent(request)
      .then(response => {
        axios.defaults.headers.common = { Authorization: `bearer ${response.accessToken}` };
        // setAccessToken(response.accessToken);
        //setAccessToken(response.accessToken);
      })
      .catch(error => {
        // acquireTokenSilent can fail for a number of reasons, fallback to interaction
        if (error instanceof InteractionRequiredAuthError) {
          instance.acquireTokenPopup(request).then(response => {
            axios.defaults.headers.common = { Authorization: `bearer ${response.accessToken}` };
            //setAccessToken(response.accessToken);
          });
        }
      });
  });
}

export default App;
