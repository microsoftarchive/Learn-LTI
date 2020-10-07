/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import React from 'react';
import { IThemeOnlyProps, SimpleComponentStyles, IStylesOnly } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { styled, Text, FontWeights, FontSizes } from '@fluentui/react';
import { themedClassNames } from '../../Core/Utils/FluentUI';

export interface StudentViewSectionProps {
  title: string;
  textContent?: string;
  content?: JSX.Element;
}
export type StudentViewSectionStyles = SimpleComponentStyles<'root' | 'title' | 'textContent'>;

const StudentViewSectionInner = ({
  content,
  title,
  textContent,
  styles
}: StudentViewSectionProps & IStylesOnly<StudentViewSectionStyles>): JSX.Element => {
  const classes = themedClassNames(styles);
  return (
    <div className={classes.root}>
      <Text block variant="mediumPlus" className={classes.title}>
        {title}
      </Text>
      {textContent && (
        <Text block variant="medium" className={classes.textContent}>
          {textContent}
        </Text>
      )}
      {content}
    </div>
  );
};

const studentViewSectionStyles = ({ theme }: IThemeOnlyProps): StudentViewSectionStyles => ({
  root: [{}],
  title: [
    {
      color: theme.palette.neutralPrimary,
      fontWeight: FontWeights.semibold,
      marginBottom: theme.spacing.m,
      lineHeight: FontSizes.xLarge
    }
  ],
  textContent: [
    {
      color: theme.palette.neutralPrimary,
      lineHeight: FontSizes.mediumPlus,
      whiteSpace: 'pre-wrap'
    }
  ]
});

export const StudentViewSection = styled(StudentViewSectionInner, studentViewSectionStyles);
