/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import React, { useEffect } from 'react';
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
import { pagesDisplayNames } from '../../Router/Consts';
import { useLocation } from 'react-router-dom';

type MicrosoftLearnPageStyles = SimpleComponentStyles<'root' | 'separator'>;

const MicrosoftLearnPageInner = ({ styles }: IStylesOnly<MicrosoftLearnPageStyles>): JSX.Element => {
  const learnStore = useStore('microsoftLearnStore');
  let { learnFilterUriParam, productMap } = learnStore.filterStore
  const location = useLocation();  
  const qsParams = new URLSearchParams(location.search);

  useEffect(() => {
    if (learnStore.catalog == null) {
      learnStore.initializeCatalog(qsParams);
    }
  }, [learnStore, qsParams]);

  // The following hook is called whenever location updates (eg: through browser back button).
  // Filters are re-initialized based on the search params present in the location object, and the content gets updated accordingly.
  // [Note]- This does not get called when filterStore.updateHistory is trigerred because we use H.createBrowserHistory to update the URL.
  //       URL updation using it does not cause the current page to reload. 
  useEffect(() => {
    if(!learnStore.isLoadingCatalog && (location.search!=='?'+learnFilterUriParam || location.search!==learnFilterUriParam)){
      learnStore.filterStore.initializeFilters(learnStore.catalog!!, qsParams);
    }
  }, [location])

  const classes = themedClassNames(styles);
  return useObserver(() => {
    return (
      <PageWrapper title={pagesDisplayNames.MSLEARN}>
        <div className={classes.root}>
          <MicrosoftLearnSearch styles={themedClassNames(microsoftLearnSearchStyles)} />
          <MicrosoftLearnSelectedItemsList styles={themedClassNames(microsoftLearnSelectedItemsStyles)} />
          <Separator className={classes.separator} />
          <MicrosoftLearnList />
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
      marginBottom: `calc(${theme.spacing.l1} + ${theme.spacing.s1})`,
      selectors: {
        '::before': {
          backgroundColor: theme.semanticColors.bodyDivider
        }
      }
    })
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