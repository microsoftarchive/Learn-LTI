/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import React from 'react';
import { IThemeOnlyProps, IStylesOnly } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { styled, Shimmer, mergeStyleSets, FontSizes } from '@fluentui/react';
import { themedClassNames } from '../../Core/Utils/FluentUI';
import { assignmentLinkDisplayItemStyles, AssignmentLinkDisplayItemStyles } from './AssignmentLinkDisplayItem';

type AssignmentLinkItemShimmerStyles = Partial<AssignmentLinkDisplayItemStyles>;

const AssignmentLinkItemShimmerInner = ({ styles }: IStylesOnly<AssignmentLinkItemShimmerStyles>): JSX.Element => {
  const classes = themedClassNames(styles);
  const displayItemClasses = themedClassNames(assignmentLinkDisplayItemStyles);

  const mergedStyles = mergeStyleSets(displayItemClasses, classes);

  return (
    <div className={mergedStyles.root}>
      <Shimmer width="25%" className={mergedStyles.displayText} />
      <Shimmer width="100%" className={mergedStyles.descriptionText} />
      <Shimmer width="75%" className={mergedStyles.descriptionText} />
    </div>
  );
};

const assignmentLinkItemShimmerStyles = ({ theme }: IThemeOnlyProps): Partial<AssignmentLinkItemShimmerStyles> => ({
  root: [
    {
      paddingTop: theme.spacing.l1,
      paddingBottom: theme.spacing.s1
    }
  ],
  displayText: [
    {
      height: FontSizes.xxLarge
    }
  ],
  descriptionText: [
    {
      height: FontSizes.xxLarge
    }
  ]
});

export const AssignmentLinkItemShimmer = styled(AssignmentLinkItemShimmerInner, assignmentLinkItemShimmerStyles);
