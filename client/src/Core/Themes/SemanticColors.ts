/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { getTheme } from '@fluentui/react';

const defaultTheme = getTheme();

export const semanticColors = {
  inputBorder: defaultTheme.palette.neutralQuaternaryAlt,
  smallInputBorder: defaultTheme.palette.neutralQuaternaryAlt,
  inputText: defaultTheme.palette.neutralDark,
  infoBackground: '#fffdfd',
  successIcon: '#7FBA00',
  successBackground: '#DFEFD9'
};
