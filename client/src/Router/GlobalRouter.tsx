/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { routesConstants } from './Consts';

//Declaring required props
export interface GlobalRouterProps {
  AssignmentRouteComponent: JSX.Element;
  PlatformRegistrationComponent: JSX.Element;
}

// GlobalRouter component has 2 required props:
// +AssignmentRouteComponent
// +PlatformRegistrationComponent
export const GlobalRouter = ({
  AssignmentRouteComponent,
  PlatformRegistrationComponent
}: GlobalRouterProps): JSX.Element => {
  return (
    // Routing
    <Switch>
      <Route path={routesConstants.PLATFORM}>{PlatformRegistrationComponent}</Route>
      <Route path={routesConstants.ASSIGNMENT_ID}>{AssignmentRouteComponent}</Route>
    </Switch>
  );
};
