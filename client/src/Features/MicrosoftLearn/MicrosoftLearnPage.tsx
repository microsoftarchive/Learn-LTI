/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import React, { useEffect, useState } from 'react';
import { useObserver } from 'mobx-react-lite';
import { useStore } from '../../Stores/Core';
import { MicrosoftLearnList } from './MicrosoftLearnList';
import { PageWrapper } from '../../Core/Components/Common/PageWrapper';
import { themedClassNames } from '../../Core/Utils/FluentUI';
import { SimpleComponentStyles, IStylesOnly, IThemeOnlyProps } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { styled, Separator, mergeStyles } from '@fluentui/react';
import { MicrosoftLearnSearch, MicrosoftLearnSearchStyles } from './MicrosoftLearnSearch';
import {
  MicrosoftLearnSelectedItemsList,
  MicrosoftLearnSelectedItemsListStyles
} from './MicrosoftLearnSelectedItemsList';
import { getCommonSpacingStyle } from './MicrosoftLearnStyles';
import { MicrosoftLearnFilterPane } from './MicrosoftLearnFilterPane';
import { debounce } from 'lodash';
import { MicrosoftLearnFilterTags } from './MicrosoftLearnFilterTags';
import { useLocation } from 'react-router-dom';
import { pagesDisplayNames } from '../../Router/Consts';

type MicrosoftLearnPageStyles = SimpleComponentStyles<'root' | 'separator' | 'wrapper'>;

export const TAB_SCREEN_SIZE = 768;

const MicrosoftLearnPageInner = ({ styles }: IStylesOnly<MicrosoftLearnPageStyles>): JSX.Element => {
  const learnStore = useStore('microsoftLearnStore');
  const { filterStore, catalog } = learnStore
  const location = useLocation();
  const qsParams = new URLSearchParams(location.search);

  useEffect(() => {
    if (learnStore.catalog == null) {
      learnStore.initializeCatalog(qsParams);
    }
  }, [learnStore, qsParams]);

  // Filters are re-initialized based on the search params present in the location object (on browser back/forward), and the content gets updated accordingly.
  // [Note]- This does not get called when filterStore.updateHistory is trigerred because we use H.createBrowserHistory to update the URL.
  //       URL updation using it does not cause the current page to reload.

  // TODO: Refactor the logic to start using useHistory hook for history management with proper UI update

  useEffect(() => {
    if (
      catalog !== null &&
      location.search !== '?' + filterStore.learnFilterUriParam && location.search !== filterStore.learnFilterUriParam
    ) {
      filterStore.initializeFilters(catalog!!, new URLSearchParams(location.search));
    }  
  }, [location]) // eslint-disable-line react-hooks/exhaustive-deps

  const classes = themedClassNames(styles);
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const debouncedHandleResize = debounce(function handleResize() {
      setWidth(window.innerWidth);
    }, 500);
    window.addEventListener('resize', debouncedHandleResize);
    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
    };
  });

  return useObserver(() => {

      return (
        <PageWrapper title={pagesDisplayNames.MSLEARN}>
        <div className={classes.wrapper}>
          {width > TAB_SCREEN_SIZE && <MicrosoftLearnFilterPane />}
          <div className={classes.root}>
            <MicrosoftLearnSearch styles={themedClassNames(microsoftLearnSearchStyles)} />
            <MicrosoftLearnSelectedItemsList styles={themedClassNames(microsoftLearnSelectedItemsStyles)} />
            <Separator className={classes.separator} />
            {width <= TAB_SCREEN_SIZE && <MicrosoftLearnFilterPane />}
            <MicrosoftLearnFilterTags />
            <MicrosoftLearnList />
          </div>
        </div>
        </PageWrapper>
      );
  });
};

const microsoftLearnPageStyles = ({ theme }: IThemeOnlyProps): MicrosoftLearnPageStyles => ({
  root: [
    {
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    }
  ],
  separator: [
    mergeStyles(getCommonSpacingStyle(theme), {
      fontSize: 0,
      padding: 0,
      marginTop: theme.spacing.s1,
      marginBottom: `calc(${theme.spacing.l1}*0.5 + ${theme.spacing.s1})`,
      selectors: {
        '::before': {
          backgroundColor: theme.semanticColors.bodyDivider
        }
      }
    })
  ],
  wrapper: [
    {
      display: 'flex',
      flexDirection: 'row',
      marginTop: theme.spacing.l1
    }
  ]
});

const microsoftLearnSearchStyles = ({ theme }: IThemeOnlyProps): Partial<MicrosoftLearnSearchStyles> => ({
  root: [getCommonSpacingStyle(theme)]
});
const microsoftLearnSelectedItemsStyles = ({
  theme
}: IThemeOnlyProps): Partial<MicrosoftLearnSelectedItemsListStyles> => ({
  header: [getCommonSpacingStyle(theme)]
});
export const MicrosoftLearnPage = styled(MicrosoftLearnPageInner, microsoftLearnPageStyles);
