import { routesConstants } from './Consts';
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
    name: 'General',
    url: routesConstants.ROOT,
    icon: 'Settings',
    component: GeneralPage
  },
  {
    name: 'Tutorials',
    url: routesConstants.TUTORIALS,
    icon: 'LearningTools',
    component: MicrosoftLearnPage
  }
];

export const viewRoutes: RouteProps[] = [
  {
    name: 'Preview',
    url: routesConstants.PREVIEW,
    icon: 'RedEye',
    component: PreviewPage
  },
  {
    name: 'Participants',
    url: routesConstants.PARTICIPANTS,
    icon: 'Group',
    component: ParticipantsPage
  }
];
