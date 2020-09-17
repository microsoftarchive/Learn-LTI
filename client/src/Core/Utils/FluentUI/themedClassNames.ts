/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { classNamesFunction, IStyleFunctionOrObject, IStyleSet, IProcessedStyleSet, getTheme } from '@fluentui/react';
import { IThemeOnlyProps } from './typings.fluent-ui';

export const themedClassNames = <TStyleSet extends IStyleSet<TStyleSet>>(
  styles: IStyleFunctionOrObject<IThemeOnlyProps, TStyleSet> | undefined
): IProcessedStyleSet<TStyleSet> => {
  const currentTheme = getTheme();

  return classNamesFunction<IThemeOnlyProps, TStyleSet>()(styles, {
    theme: currentTheme
  });
};
