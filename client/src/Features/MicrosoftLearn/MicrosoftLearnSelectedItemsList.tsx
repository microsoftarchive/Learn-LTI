/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import React from 'react';
import { SimpleComponentStyles, IStylesOnly, IThemeOnlyProps } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import {
  styled,
  Text,
  FontWeights,
  FontSizes,
  Spinner,
  SpinnerSize,
  IButtonStyles,
  IButtonProps
} from '@fluentui/react';
import { useStore } from '../../Stores/Core';
import { MicrosoftLearnSelectedItem } from './MicrosoftLearnSelectedItem';
import { FIXED_ITEM_WIDTH } from './MicrosoftLearnStyles';
import { useObserver } from 'mobx-react-lite';
import { MicrosoftLearnRemoveSelectedItemsButton } from './MicrosoftLearnRemoveSelectedItemsButton';
import { themedClassNames } from '../../Core/Utils/FluentUI';
import { MicrosoftLearnSelectedItemShimmer } from './MicrosoftLearnSelectedItemShimmer';

export type MicrosoftLearnSelectedItemsListStyles = SimpleComponentStyles<
  'root' | 'header' | 'title' | 'spinner' | 'list'
>;

const removeSelectedItemsButtonStyles = (_styleProps: IButtonProps): Partial<IButtonStyles> => ({
  root: [
    {
      marginLeft: 'auto'
    }
  ]
});

const MicrosoftLearnRemoveSelectedItemsButtonInHeader = styled(
  MicrosoftLearnRemoveSelectedItemsButton,
  removeSelectedItemsButtonStyles
);

const MicrosoftLearnSelectedItemsListInner = ({
  styles
}: IStylesOnly<MicrosoftLearnSelectedItemsListStyles>): JSX.Element => {
  const learnStore = useStore('microsoftLearnStore');

  return useObserver(() => {
    const classes = themedClassNames(styles);

    return (
      <div className={classes.root}>
        <div className={classes.header}>
          <Text variant="medium" className={classes.title}>
            {`Selected Tutorials (${learnStore?.selectedItems?.length || '0'})`}
          </Text>
          {(!learnStore.selectedItems || learnStore.isLoadingCatalog) && (
            <Spinner size={SpinnerSize.small} className={classes.spinner} />
          )}
          <MicrosoftLearnRemoveSelectedItemsButtonInHeader />
        </div>
        {learnStore.selectedItems && learnStore.selectedItems.length > 0 && (
          <div className={classes.list}>
            {learnStore.selectedItems?.map(item =>
              learnStore.catalog ? (
                <MicrosoftLearnSelectedItem key={item.contentUid} itemId={item.contentUid} />
              ) : (
                <MicrosoftLearnSelectedItemShimmer />
              )
            )}
          </div>
        )}
      </div>
    );
  });
};

const microsoftLearnSelectedItemsListStyles = ({ theme }: IThemeOnlyProps): MicrosoftLearnSelectedItemsListStyles => ({
  root: [
    {
      marginRight: theme.spacing.s1
    }
  ],
  header: [
    {
      display: 'flex',
      boxSizing: 'border-box',
      alignItems: 'center',
      flexWrap: 'wrap',
      paddingTop: theme.spacing.l1
    }
  ],
  title: [
    {
      color: theme.palette.neutralPrimary,
      fontWeight: FontWeights.semibold,
      lineHeight: FontSizes.xLargePlus
    }
  ],
  spinner: [
    {
      marginLeft: theme.spacing.s1
    }
  ],
  list: [
    {
      display: 'grid',
      overflowY: 'hidden',
      gridRowGap: theme.spacing.m,
      height: 'min-content',
      gridTemplateColumns: `repeat(auto-fill,minmax(${FIXED_ITEM_WIDTH}px, 1fr) )`,
      marginBottom: `calc(${theme.spacing.l2} - ${theme.spacing.s1})`,
      marginTop: theme.spacing.m
    }
  ]
});

export const MicrosoftLearnSelectedItemsList = styled(
  MicrosoftLearnSelectedItemsListInner,
  microsoftLearnSelectedItemsListStyles
);
