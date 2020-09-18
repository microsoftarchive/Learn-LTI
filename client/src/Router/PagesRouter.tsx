/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import React from 'react';
import { Switch, Route, Redirect, useLocation } from 'react-router-dom';
import _ from 'lodash';
import { routesConstants } from './Consts';
import { configurationRoutes, viewRoutes } from './RoutesConfiguration';
import { useObserver } from 'mobx-react-lite';
import { useStore } from '../Stores/Core';
import { MainPagesWrapper } from '../Core/Components/MainPagesWrapper';

export const PagesRouter = (): JSX.Element => {
  const assignmentStore = useStore('assignmentStore');

  const getPathForPage = (routeUrl: string): string => {
    const pathUpToPage = `${routesConstants.ASSIGNMENT_ID}`;
    return `${pathUpToPage}${routeUrl}`;
  };

  const routes = _.orderBy([...configurationRoutes, ...viewRoutes], 'url', 'desc');

  const { pathname } = useLocation();
  const pathNameEndingWithSlash = '/:url*(/+)';

  const getRedirectPath = (assignmentId: string | undefined): string => {
    return assignmentId ? `/${assignmentId}${viewRoutes[0].url}` : '/';
  };

  return useObserver(() => (
    <Switch>
      <Redirect from={pathNameEndingWithSlash} to={pathname.slice(0, -1)} />
      {_.map(assignmentStore?.assignment?.publishStatus === 'Published' ? configurationRoutes : [], (route, i) => (
        <Redirect
          from={getPathForPage(route.url)}
          to={getRedirectPath(assignmentStore?.assignment?.id)}
          exact
          key={i}
        />
      ))}
      {_.map(routes, (route, i) => {
        const Component = route.component;
        return (
          <Route
            path={getPathForPage(route.url)}
            component={() => (
              <MainPagesWrapper>
                <Component />
              </MainPagesWrapper>
            )}
            key={i}
          />
        );
      })}
    </Switch>
  ));
};
