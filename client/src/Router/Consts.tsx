/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import _ from 'lodash';

export const pagesDisplayNames = {
  GENERAL: 'General',
  MSLEARN: 'Microsoft Learn',
  PREVIEW: 'Preview',
  PARTICIPANTS: 'Participants'
};

function getRouteFromDisplayName(displayName: string): string {
  return _.kebabCase(displayName.toLowerCase());
}

export const routesConstants = {
  ROOT: '',
  PLATFORM: '/platform',
  ASSIGNMENT_ID: '/:assignmentId',
  MSLEARN: `/${getRouteFromDisplayName(pagesDisplayNames.MSLEARN)}`,
  PREVIEW: `/${getRouteFromDisplayName(pagesDisplayNames.PREVIEW)}`,
  PARTICIPANTS: `/${getRouteFromDisplayName(pagesDisplayNames.PARTICIPANTS)}`
};
