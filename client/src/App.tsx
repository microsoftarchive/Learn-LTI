/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import React from 'react';
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
import { InteractionType } from '@azure/msal-browser';
import { MsalAuthenticationTemplate, MsalProvider } from '@azure/msal-react';
import { AxiosBasicAuthInitializer } from './Core/Auth/AxiosBasicAuthInitializer';

const rootStore: RootStore = new RootStore();

function App() {
  registerIcons(fabricIconsData);
  initializeIcons();
  loadTheme(appTheme);

  let request;
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
  } else {
    request = {
      scopes: [process.env.REACT_APP_EDNA_DEFAULT_SCOPE!]
    };
  }

  return (
    <BrowserRouter>
      <MsalProvider instance={AppAuthConfig}>
        <MsalAuthenticationTemplate interactionType={InteractionType.Redirect} authenticationRequest={request}>
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

export default App;
