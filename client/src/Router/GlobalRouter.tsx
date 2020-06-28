import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { routesConstants } from './Consts';

export interface GlobalRouterProps {
  AssignmentRouteComponent: JSX.Element;
  PlatformRegistrationComponent: JSX.Element;
}

export const GlobalRouter = ({
  AssignmentRouteComponent,
  PlatformRegistrationComponent
}: GlobalRouterProps): JSX.Element => {
  return (
    <Switch>
      <Route path={routesConstants.PLATFORM}>{PlatformRegistrationComponent}</Route>
      <Route path={routesConstants.ASSIGNMENT_ID}>{AssignmentRouteComponent}</Route>
    </Switch>
  );
};
