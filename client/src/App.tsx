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
        'https://' + process.env.REACT_APP_EDNA_B2C_TENANT! + '.onmicrosoft.com/api/b2c.read'
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

export default App;
