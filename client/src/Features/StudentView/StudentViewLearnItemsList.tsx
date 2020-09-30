/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import React, { useEffect } from 'react';
import { IThemeOnlyProps, SimpleComponentStyles, IStylesOnly } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { styled } from '@fluentui/react';
import { themedClassNames } from '../../Core/Utils/FluentUI';
import { useStore } from '../../Stores/Core';
import { useObserver } from 'mobx-react-lite';
import { MicrosoftLearnItem, MicrosoftLearnItemStyles } from '../MicrosoftLearn/MicrosoftLearnItem';
import { FIXED_ITEM_HEIGHT, FIXED_ITEM_WIDTH } from '../MicrosoftLearn/MicrosoftLearnStyles';
import { MicrosoftLearnItemShimmer } from '../MicrosoftLearn/MicrosoftLearnItemShimmer';

type StudentViewLearnItemsListStyles = SimpleComponentStyles<'root' | 'linkWrapper'>;

const StudentViewLearnItemsListInner = ({ styles }: IStylesOnly<StudentViewLearnItemsListStyles>): JSX.Element => {
  const classes = themedClassNames(styles);
  const learnStore = useStore('microsoftLearnStore');

  useEffect(() => {
    if (learnStore.catalog == null) {
      learnStore.initializeCatalog();
    }
  }, [learnStore]);

  return useObserver(() => (
    <div className={classes.root}>
      {learnStore.selectedItems &&
        learnStore.selectedItems.map(selectedItem => {
          const contentItem = learnStore.catalog?.contents.get(selectedItem.contentUid);

          return contentItem ? (
            <a className={classes.linkWrapper} target="_blank" rel="noopener noreferrer" href={contentItem.url}>
              <MicrosoftLearnItem key={selectedItem.contentUid} item={contentItem} styles={microsoftLearnItemStyles} />
            </a>
          ) : !learnStore.catalog ? (
            <div className={classes.linkWrapper}>
              <MicrosoftLearnItemShimmer />
            </div>
          ) : null;
        })}
    </div>
  ));
};

const studentViewLearnItemsListStyles = ({ theme }: IThemeOnlyProps): StudentViewLearnItemsListStyles => {
  return {
    root: [
      {
        marginLeft: `calc(-1 * ${theme.spacing.s1})`,
        display: 'grid',
        overflow: 'auto',
        gridRowGap: theme.spacing.m,
        gridTemplateColumns: `repeat(auto-fill,minmax(${FIXED_ITEM_WIDTH}px, 1fr) )`,
        position: 'relative'
      }
    ],
    linkWrapper: [
      {
        width: `calc(100% - ${theme.spacing.m})`,
        height: FIXED_ITEM_HEIGHT,
        textDecoration: 'none'
      }
    ]
  };
};

const microsoftLearnItemStyles = ({ theme }: IThemeOnlyProps): Partial<MicrosoftLearnItemStyles> => ({
  root: [
    {
      width: '100%',
      marginLeft: theme.spacing.s1,
      overflow: 'hidden',
      borderWidth: 0
    }
  ],
  innerRoot: [
    {
      pointerEvents: 'none'
    }
  ],
  topBar: [
    {
      borderWidth: 0
    }
  ],
  footer: [
    {
      display: 'none'
    }
  ]
});

export const StudentViewLearnItemsList = styled(StudentViewLearnItemsListInner, studentViewLearnItemsListStyles);
