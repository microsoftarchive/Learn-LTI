/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import React from 'react';
import { IThemeOnlyProps, SimpleComponentStyles, IStylesOnly } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { styled, mergeStyleSets, Shimmer, ShimmerElementType, IShimmerElement } from '@fluentui/react';
import { themedClassNames } from '../../Core/Utils/FluentUI';
import { MicrosoftLearnItemStyles, microsoftLearnItemStyles } from './MicrosoftLearnItem';

type MicrosoftLearnItemShimmerStyles = SimpleComponentStyles<'root'>;

const MicrosoftLearnItemShimmerInner = ({ styles }: IStylesOnly<MicrosoftLearnItemShimmerStyles>): JSX.Element => {
  const classes = themedClassNames(styles);
  const displayItemClasses = themedClassNames(microsoftLearnItemStyles);

  const mergedStyles = mergeStyleSets(displayItemClasses, classes);
  const tagsShimmerElements: IShimmerElement[] = [
    { type: ShimmerElementType.line, width: '25%' },
    { type: ShimmerElementType.gap, width: '4px' },
    { type: ShimmerElementType.line, width: '20%' },
    { type: ShimmerElementType.gap, width: '4px' },
    { type: ShimmerElementType.line, width: '30%' }
  ];
  return (
    <div className={mergedStyles.root}>
      <Shimmer customElementsGroup={<div className={mergedStyles.topBar}></div>} width="100%" />
      <div className={mergedStyles.icon}>
        <Shimmer
          shimmerElements={[{ type: ShimmerElementType.circle, width: '100%', height: 64 }]}
          width="100%"
          height="100%"
        />
      </div>
      <div className={mergedStyles.content}>
        <Shimmer width="30%" className={mergedStyles.type} />
        <div className={mergedStyles.title}>
          <Shimmer width="100%" />
          <Shimmer width="50%" className={mergedStyles.title} />
        </div>
        <Shimmer shimmerElements={tagsShimmerElements} width="60%" />
      </div>
    </div>
  );
};

const microsoftLearnItemShimmerStyles = ({ theme }: IThemeOnlyProps): Partial<MicrosoftLearnItemStyles> => ({
  root: [
    {
      boxShadow: 'none',
      borderWidth: 1,
      overflow: 'hidden',
      justifyContent: 'flex-start',
      borderColor: theme.palette.neutralLighter,
      selectors: {
        ':hover': {
          boxShadow: 'none',
          transform: 'none'
        }
      }
    }
  ],
  topBar: [
    {
      backgroundColor: 'none',
      margin: 0,
      padding: 0,
      borderWidth: 0
    }
  ],
  content: [
    {
      marginTop: theme.spacing.l2
    }
  ],
  type: [
    {
      marginBottom: theme.spacing.s1
    }
  ],
  title: [
    {
      marginTop: theme.spacing.s1
    }
  ],
  icon: [
    {
      borderRadius: theme.spacing.l2,
      position: 'absolute',
      marginLeft: theme.spacing.l2,
      overflow: 'hidden'
    }
  ]
});

export const MicrosoftLearnItemShimmer = styled(MicrosoftLearnItemShimmerInner, microsoftLearnItemShimmerStyles);
