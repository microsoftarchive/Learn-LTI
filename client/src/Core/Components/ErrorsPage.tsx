/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import React from 'react';
import { IThemeOnlyProps, SimpleComponentStyles, IStylesOnly } from '../Utils/FluentUI/typings.fluent-ui';
import { styled, Icon, Text, FontSizes, FontWeights } from '@fluentui/react';
import { themedClassNames } from '../Utils/FluentUI';
import { ErrorPageContent } from './ErrorPageContent';

type ErrorsPageStyles = SimpleComponentStyles<'root' | 'icon' | 'text' | 'error'>;

const ErrorPageInner = ( {styles , errorMsg, icon } : ErrorPageContent & IStylesOnly<ErrorsPageStyles> ) : JSX.Element => {
  const classes = themedClassNames(styles);
  return (
    <div className={classes.root}>
      <Icon iconName={icon} className={classes.icon} />
      <Text variant="large" className={classes.text}>
        {errorMsg}
      </Text>
      <Text variant="medium" className={classes.error}>
        We suggest you to go to our&nbsp;
        <a target='_blank' rel="noopener noreferrer" href="https://aka.ms/LearnLTI-help">help</a>
        &nbsp;page.
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
  ],
  error: [
    {
      color: theme.palette.black,
      margin: `${theme.spacing.s1} auto`
    }
  ]
});

export const ErrorPage = styled(ErrorPageInner, ErrorsPageStyles);