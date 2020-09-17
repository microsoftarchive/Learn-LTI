/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import React from 'react';
import { IThemeOnlyProps, SimpleComponentStyles, IStylesOnly } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { styled, mergeStyleSets, Shimmer, ShimmerElementType, IShimmerElement } from '@fluentui/react';
import { themedClassNames } from '../../Core/Utils/FluentUI';
import { MicrosoftLearnSelectedItemStyles, microsoftLearnSelectedItemStyles } from './MicrosoftLearnSelectedItem';

type MicrosoftLearnSelectedItemShimmerStyles = SimpleComponentStyles<'root'>;

const MicrosoftLearnSelectedItemShimmerInner = ({
  styles
}: IStylesOnly<MicrosoftLearnSelectedItemShimmerStyles>): JSX.Element => {
  const classes = themedClassNames(styles);
  const displayItemClasses = themedClassNames(microsoftLearnSelectedItemStyles);

  const mergedStyles = mergeStyleSets(displayItemClasses, classes);
  const infoShimmerElements: IShimmerElement[] = [
    { type: ShimmerElementType.line, width: '55%' },
    { type: ShimmerElementType.gap, width: '8px' },
    { type: ShimmerElementType.circle, height: 5 },
    { type: ShimmerElementType.gap, width: '8px' },
    { type: ShimmerElementType.line, width: '40%' }
  ];
  return (
    <div className={mergedStyles.root}>
      <div className={mergedStyles.itemIcon}>
        <Shimmer
          shimmerElements={[{ type: ShimmerElementType.circle, width: '100%', height: 64 }]}
          width="100%"
          height="100%"
        />
      </div>
      <div className={mergedStyles.content}>
        <Shimmer width="80%" className={mergedStyles.tooltipHost} />
        <Shimmer shimmerElements={infoShimmerElements} width="50%" />
      </div>
    </div>
  );
};

const microsoftLearnSelectedItemShimmerStyles = ({
  theme
}: IThemeOnlyProps): Partial<MicrosoftLearnSelectedItemStyles> => ({
  root: [
    {
      boxShadow: 'none',
      borderWidth: 1,
      overflow: 'hidden',
      justifyContent: 'flex-start',
      borderColor: theme.palette.neutralLighter
    }
  ],
  tooltipHost: [
    {
      marginBottom: theme.spacing.m
    }
  ]
});

export const MicrosoftLearnSelectedItemShimmer = styled(
  MicrosoftLearnSelectedItemShimmerInner,
  microsoftLearnSelectedItemShimmerStyles
);
