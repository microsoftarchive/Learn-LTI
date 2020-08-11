import React from 'react';
import { IThemeOnlyProps, SimpleComponentStyles, IStylesOnly } from '../../Utils/FluentUI/typings.fluent-ui';
import { styled, Icon, Text, FontSizes, FontWeights } from '@fluentui/react';
import { themedClassNames } from '../../Utils/FluentUI';

type NoAuthErrorPageStyles = SimpleComponentStyles<'root' | 'icon' | 'text'>;
const NoAuthErrorPageInner = ({ styles }: IStylesOnly<NoAuthErrorPageStyles>): JSX.Element => {
  const classes = themedClassNames(styles);
    
  return (
        <div className={classes.root}>
        <Icon iconName="" className={classes.icon} />
        <Text variant="large" className={classes.text}>
        No permission to view this page.
        </Text>
        </div>
        );
      
};

const NoAuthErrorPageStyles = ({ theme }: IThemeOnlyProps): NoAuthErrorPageStyles => ({
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

export const NoAuthErrorPage = styled(NoAuthErrorPageInner, NoAuthErrorPageStyles);
