import { IPropsWithStyles, ITheme, IStyle } from '@fluentui/react';

type SimpleComponentStyles<K extends string | number | symbol> = Record<K, IStyle>;

type IThemeOnlyProps = { theme: ITheme };
type IStylesOnly<TStyleSet extends IStyleSet<TStyleSet>> = IPropsWithStyles<IThemeOnlyProps, TStyleSet>;
