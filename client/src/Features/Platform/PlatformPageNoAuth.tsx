import React from 'react';
import { IThemeOnlyProps, SimpleComponentStyles, IStylesOnly } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { styled, Icon, Text, FontSizes, FontWeights } from '@fluentui/react';
import { themedClassNames } from '../../Core/Utils/FluentUI';

type PlatformPageNoAuthStyles = SimpleComponentStyles<'root' | 'icon' | 'text'>;

const PlatformPageNoAuthInner = ({ styles }: IStylesOnly<PlatformPageNoAuthStyles>): JSX.Element => {
  const classes = themedClassNames(styles);
  return (
    <div className={classes.root}>
      <Icon iconName="BlockedSiteSolid12" className={classes.icon} />
      <Text variant="large" className={classes.text}>
        No sufficient permissions to view this page.
      </Text>
    </div>
  );
};

const PlatformPageNoAuthStyles = ({ theme }: IThemeOnlyProps): PlatformPageNoAuthStyles => ({
  root: [
    {
      margin: `${theme.spacing.l2} auto`,
      display: 'flex',
      flexDirection: 'column'
    }
  ],
  icon: [
    {
      color: theme.semanticColors.errorIcon,
      fontSize: FontSizes.xxLarge,
      alignSelf: 'center'
    }
  ],
  text: [
    {
      color: theme.palette.themePrimary,
      fontWeight: FontWeights.bold,
      margin: `${theme.spacing.s1} auto`
    }
  ]
});

export const PlatformPageNoAuth = styled(PlatformPageNoAuthInner, PlatformPageNoAuthStyles);
