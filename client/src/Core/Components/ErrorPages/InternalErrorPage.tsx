import React from 'react';
import { IThemeOnlyProps, SimpleComponentStyles, IStylesOnly } from '../../Utils/FluentUI/typings.fluent-ui';
import { styled, Icon, Text, FontSizes, FontWeights } from '@fluentui/react';
import { themedClassNames } from '../../Utils/FluentUI';

type InternalErrorPageStyles = SimpleComponentStyles<'root' | 'icon' | 'text'>;
const InternalErrorPageInner = ({ styles }: IStylesOnly<InternalErrorPageStyles>): JSX.Element => {
  const classes = themedClassNames(styles);
    return (
        <div className={classes.root}>
        <Icon iconName="" className={classes.icon} />
        <Text variant="large" className={classes.text}>
        Internal Error. Try again later.
        </Text>
        </div>
        );
};

const InternalErrorPageStyles = ({ theme }: IThemeOnlyProps): InternalErrorPageStyles => ({
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

export const InternalErrorPage = styled(InternalErrorPageInner, InternalErrorPageStyles);
