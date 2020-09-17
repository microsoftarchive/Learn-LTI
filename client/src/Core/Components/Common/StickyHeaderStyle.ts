/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ITheme, IStyle } from '@fluentui/react';

export const stickyHeaderStyle = (theme: ITheme): IStyle => ({
  position: 'sticky',
  top: 0,
  zIndex: 1,
  backgroundColor: theme.palette.neutralLighterAlt,
  borderBottomStyle: 'solid',
  borderColor: theme.palette.neutralQuaternaryAlt,
  borderWidth: 1
});
