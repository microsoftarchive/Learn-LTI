/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import _ from 'lodash';

export const pagesDisplayNames = {
  GENERAL: 'General',
  MSLEARN: 'MS Learn',
  PREVIEW: 'Preview',
  PARTICIPANTS: 'Participants'
};

const getRouteFromDisplayName = (displayName: string): string => {
  return _.kebabCase(_.toLower(displayName));
};

export const routesConstants = {
  ROOT: '',
  PLATFORM: '/platform',
  ASSIGNMENT_ID: '/:assignmentId',
  MSLEARN: `/${getRouteFromDisplayName(pagesDisplayNames.MSLEARN)}`,
  PREVIEW: `/${getRouteFromDisplayName(pagesDisplayNames.PREVIEW)}`,
  PARTICIPANTS: `/${getRouteFromDisplayName(pagesDisplayNames.PARTICIPANTS)}`
};
