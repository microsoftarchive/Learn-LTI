/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { IPropsWithStyles, ITheme, IStyle } from '@fluentui/react';

type SimpleComponentStyles<K extends string | number | symbol> = Record<K, IStyle>;

type IThemeOnlyProps = { theme: ITheme };
type IStylesOnly<TStyleSet extends IStyleSet<TStyleSet>> = IPropsWithStyles<IThemeOnlyProps, TStyleSet>;
