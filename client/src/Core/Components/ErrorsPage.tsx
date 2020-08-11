import React from 'react';
import { IThemeOnlyProps, SimpleComponentStyles, IStylesOnly } from '../Utils/FluentUI/typings.fluent-ui';
import { styled, Icon, Text, FontSizes, FontWeights } from '@fluentui/react';
import { themedClassNames } from '../Utils/FluentUI';

type ErrorsPageStyles = SimpleComponentStyles<'root' | 'icon' | 'text'>;

const NotFoundErrorPageInner = ({ styles }: IStylesOnly<ErrorsPageStyles>): JSX.Element => {
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

const InternalErrorPageInner = ({ styles }: IStylesOnly<ErrorsPageStyles>): JSX.Element => {
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

const NoAuthErrorPageInner = ({ styles }: IStylesOnly<ErrorsPageStyles>): JSX.Element => {
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

const PlatformPageNoAuthErrorPageInner = ({ styles }: IStylesOnly<ErrorsPageStyles>): JSX.Element => {
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

const ErrorsPageStyles = ({ theme }: IThemeOnlyProps): ErrorsPageStyles => ({
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

export const NotFoundErrorPage = styled(NotFoundErrorPageInner, ErrorsPageStyles);
export const InternalErrorPage = styled(InternalErrorPageInner, ErrorsPageStyles);
export const NoAuthErrorPage = styled(NoAuthErrorPageInner, ErrorsPageStyles);
export const PlatformPageNoAuthErrorPage = styled(PlatformPageNoAuthErrorPageInner, ErrorsPageStyles);
