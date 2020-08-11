import React from 'react';
import { IThemeOnlyProps, SimpleComponentStyles, IStylesOnly } from '../../Utils/FluentUI/typings.fluent-ui';
import { styled, Icon, Text, FontSizes, FontWeights } from '@fluentui/react';
import { themedClassNames } from '../../Utils/FluentUI';

type NotFoundErrorPageStyles = SimpleComponentStyles<'root' | 'icon' | 'text'>;
const NotFoundErrorPageInner = ({ styles }: IStylesOnly<NotFoundErrorPageStyles>): JSX.Element => {
  const classes = themedClassNames(styles);
    
  return (
        <div className={classes.root}>
        <Icon iconName="" className={classes.icon} />
        <Text variant="large" className={classes.text}>
        Error 404. Page Not Found.
        </Text>
        </div>
        );
      
};

const NotFoundErrorPageStyles = ({ theme }: IThemeOnlyProps): NotFoundErrorPageStyles => ({
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

export const NotFoundErrorPage = styled(NotFoundErrorPageInner, NotFoundErrorPageStyles);
