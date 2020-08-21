import React from 'react';
import { IThemeOnlyProps, SimpleComponentStyles, IStylesOnly } from '../Utils/FluentUI/typings.fluent-ui';
import { styled, Icon, Text, FontSizes, FontWeights } from '@fluentui/react';
import { themedClassNames } from '../Utils/FluentUI';
import { ServiceError } from '../Utils/Axios/ServiceError';

type ErrorsPageStyles = SimpleComponentStyles<'root' | 'icon' | 'text'>;

interface ErrorPageProps {
  errorCode: ServiceError;
}

const ErrorPageInner = ( {styles , errorCode } : ErrorPageProps & IStylesOnly<ErrorsPageStyles> ) : JSX.Element => {
  const classes = themedClassNames(styles);
  const errorMsg: string = ((error: ServiceError) => {
    switch (error) {
      case 'not found': return "Error 404. Page not found.";
      case 'unauthorized': return "No sufficient permissions to view this page.";
      case 'no content': return "You are not enrolled in this course.";
      default: return "Oops! Something went wrong!";
    }
  }) (errorCode);
  const iconName: string = errorCode==='unauthorized'? 'BlockedSiteSolid12' : '';
  return (
    <div className={classes.root}>
      <div className={classes.root}>
        <Icon iconName={iconName} className={classes.icon} />
        <Text variant="large" className={classes.text}>
          {errorMsg}
        </Text>
      </div>
      <div className={classes.root}>
        <Text variant="mediumPlus" >
          We suggest you to go to our '
          <a target='_blank' rel="noopener noreferrer" href="https://aka.ms/LearnLTI-help">HELP</a>
          ' page.
        </Text>
      </div>
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

export const ErrorPage = styled(ErrorPageInner, ErrorsPageStyles);

