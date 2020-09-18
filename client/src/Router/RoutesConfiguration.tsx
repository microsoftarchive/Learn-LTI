/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { routesConstants, pagesDisplayNames } from './Consts';
import React from 'react';
import { GeneralPage } from '../Features/GeneralPage/GeneralPage';
import { INavLink } from '@fluentui/react';
import { MicrosoftLearnPage } from '../Features/MicrosoftLearn/MicrosoftLearnPage';
import { PreviewPage } from '../Features/PreviewPage/PreviewPage';
import { ParticipantsPage } from '../Features/ParticipantsPage/ParticipantsPage';

export interface RouteProps extends INavLink {
  component: React.FunctionComponent;
}

export const configurationRoutes: RouteProps[] = [
  {
    name: pagesDisplayNames.GENERAL,
    url: routesConstants.ROOT,
    icon: 'Settings',
    component: GeneralPage
  },
  {
    name: pagesDisplayNames.MSLEARN,
    url: routesConstants.MSLEARN,
    icon: 'LearningTools',
    component: MicrosoftLearnPage
  }
];

export const viewRoutes: RouteProps[] = [
  {
    name: pagesDisplayNames.PREVIEW,
    url: routesConstants.PREVIEW,
    icon: 'RedEye',
    component: PreviewPage
  },
  {
    name: pagesDisplayNames.PARTICIPANTS,
    url: routesConstants.PARTICIPANTS,
    icon: 'Group',
    component: ParticipantsPage
  }
];
