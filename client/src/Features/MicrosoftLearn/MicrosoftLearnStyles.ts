import { ITheme, IStyle } from '@fluentui/react';

export const FIXED_ITEM_WIDTH = 380;
export const FIXED_ITEM_HEIGHT = 300;

export const getCommonHorizontalSpacer = (theme: ITheme): string => theme.spacing.s1;

export const getCommonSpacingStyle = (theme: ITheme): IStyle => {
  const commonHorizontalSpacer = getCommonHorizontalSpacer(theme);
  return {
    marginLeft: commonHorizontalSpacer,
    marginRight: commonHorizontalSpacer
  };
};
