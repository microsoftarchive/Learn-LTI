/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import React, { CSSProperties, useState } from 'react';
import { SimpleComponentStyles, IStylesOnly, IThemeOnlyProps } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { FontWeights, styled, Text } from '@fluentui/react';
import { themedClassNames } from '../../Core/Utils/FluentUI';
import { MicrosoftLearnItemShimmer } from './MicrosoftLearnItemShimmer';
import { MicrosoftLearnItem } from './MicrosoftLearnItem';
import { LearnContent } from '../../Models/Learn';
import { useStore } from '../../Stores/Core';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useObserver } from 'mobx-react-lite';
import { FIXED_ITEM_HEIGHT, FIXED_ITEM_WIDTH } from './MicrosoftLearnStyles';

type MicrosoftLearnListStyles = SimpleComponentStyles<'root' | 'noResultsText' | 'row' | 'item' | 'contentCount'>;
const ListRow = ({
  data: { numItemsPerRow, itemsData, isLoadingCatalog },
  index,
  style
}: {
  data: { numItemsPerRow: number; itemsData?: LearnContent[]; isLoadingCatalog: boolean };
  index: number;
  style: CSSProperties | undefined;
}): JSX.Element => {
  const classes = themedClassNames(microsoftLearnListStyles);

  const startIndex = index * numItemsPerRow;
  const items = [];
  for (let i = startIndex; i < startIndex + numItemsPerRow; i++) {
    items.push(
      <div className={classes.item} key={`rowKey${startIndex}itemKey${i}`}>
        {isLoadingCatalog ? (
          <MicrosoftLearnItemShimmer />
        ) : (
          itemsData && itemsData[i] && <MicrosoftLearnItem key={i} item={itemsData[i]} />
        )}
      </div>
    );
  }
  return (
    <div className={classes.row} style={style} key={`rowKey${startIndex}`}>
      {items}
    </div>
  );
};

const MicrosoftLearnListInner = ({ styles }: IStylesOnly<MicrosoftLearnListStyles>): JSX.Element => {
  const learnStore = useStore('microsoftLearnStore');

  const classes = themedClassNames(styles);

  const [autoSizerWidth, setAutoSizerWidth] = useState(0);

  return useObserver(() => {
    const isLoadingCatalog = !!learnStore.isLoadingCatalog;
    const { filteredCatalogContent } = learnStore;
    const noVisibleItems = !isLoadingCatalog && filteredCatalogContent?.length === 0;

    return (
      <div className={classes.root}>
        {noVisibleItems ? (
          <Text className={classes.noResultsText}>No items match your search. Please refine your search criteria.</Text>
        ) : (
          <>
            {filteredCatalogContent && filteredCatalogContent.length > 0 && (
              <div className={classes.contentCount}>
                <Text variant="mediumPlus" className="contentCountText">
                  {' '}
                  {filteredCatalogContent.length.toLocaleString()} results from Microsoft Learn{' '}
                </Text>
              </div>
            )}
            <AutoSizer>
              {({ height, width }): JSX.Element | null => {
                if (autoSizerWidth === 0 || Math.abs(autoSizerWidth - width) > 25) {
                  setAutoSizerWidth(width);
                }

                const numItemsPerRow = Math.floor(autoSizerWidth / FIXED_ITEM_WIDTH);
                const rowCount = filteredCatalogContent
                  ? Math.floor(filteredCatalogContent.length / numItemsPerRow) +
                    (filteredCatalogContent.length % numItemsPerRow ? 1 : 0)
                  : 2;
                return (
                  <FixedSizeList
                    style={getListStyle(isLoadingCatalog)}
                    height={height}
                    itemCount={rowCount}
                    itemData={{
                      numItemsPerRow,
                      itemsData: filteredCatalogContent,
                      isLoadingCatalog
                    }}
                    itemSize={FIXED_ITEM_HEIGHT}
                    width={autoSizerWidth}
                  >
                    {ListRow}
                  </FixedSizeList>
                );
              }}
            </AutoSizer>
          </>
        )}
      </div>
    );
  });
};

const microsoftLearnListStyles = ({ theme }: IThemeOnlyProps): MicrosoftLearnListStyles => ({
  root: [
    {
      flex: 1,
      minHeight: FIXED_ITEM_HEIGHT * 2
    }
  ],
  noResultsText: [
    {
      margin: theme.spacing.s1
    }
  ],
  row: [
    {
      display: 'flex',
      flexBasis: FIXED_ITEM_WIDTH
    }
  ],
  item: [
    {
      flex: 1
    }
  ],
  contentCount: [
    {
      marginLeft: theme.spacing.s1,
      marginBottom: theme.spacing.l1,
      selectors: {
        '.contentCountText': {
          fontWeight: FontWeights.semibold
        }
      }
    }
  ]
});

const getListStyle = (isLoadingCatalog: boolean): React.CSSProperties => ({
  overflow: isLoadingCatalog ? 'hidden' : 'auto'
});
export const MicrosoftLearnList = styled(MicrosoftLearnListInner, microsoftLearnListStyles);
