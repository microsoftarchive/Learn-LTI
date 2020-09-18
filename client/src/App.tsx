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
import { AxiosBasicAuthInitializer } from './Core/Auth/AxiosBasicAuthInitializer';
import AzureAD from 'react-aad-msal';
import { AppAuthConfig } from './Core/Auth/AppAuthConfig';
import { initializeIcons } from '@fluentui/react';
import { appTheme } from './Core/Themes/MainTheme';
import { PlatformPage } from './Features/Platform/PlatformPage';

const rootStore: RootStore = new RootStore();

function App(): JSX.Element {
  registerIcons(fabricIconsData);
  initializeIcons();
  loadTheme(appTheme);

  return (
    <BrowserRouter>
      <AzureAD provider={AppAuthConfig} forceLogin={true}>
        <AxiosBasicAuthInitializer>
          <StoreProvider rootStore={rootStore}>
            <GlobalRouter AssignmentRouteComponent={<MainLayout />} PlatformRegistrationComponent={<PlatformPage />} />
          </StoreProvider>
        </AxiosBasicAuthInitializer>
      </AzureAD>
    </BrowserRouter>
  );
}

export default App;
