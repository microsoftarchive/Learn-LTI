/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import React from 'react';
import { IThemeOnlyProps, SimpleComponentStyles, IStylesOnly } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { styled, SearchBox, Label } from '@fluentui/react';
import { themedClassNames } from '../../Core/Utils/FluentUI';
import { inputLabelStyle } from '../../Core/Components/Common/Inputs/EdnaInputStyles';
import { useStore } from '../../Stores/Core';
import { useObserver } from 'mobx-react-lite';
import { createBrowserHistory } from "history";

export type MicrosoftLearnSearchStyles = SimpleComponentStyles<'root' | 'label' | 'searchBox'>;

const MicrosoftLearnSearchInner = ({ styles }: IStylesOnly<MicrosoftLearnSearchStyles>): JSX.Element => {
  const learnStore = useStore('microsoftLearnStore');
  const { filterStore, isLoadingCatalog } = learnStore;
  const history = createBrowserHistory();  

  const classes = themedClassNames(styles);
  return useObserver(() => {
    return (
      <div className={classes.root}>
        <Label className={classes.label}>Search</Label>
        <SearchBox
          onChange={(_e: any, newValue: any)=>  filterStore.updateSearchTerm(newValue || '', history)}
          className={classes.searchBox}
          disabled={!!isLoadingCatalog}
          value= {filterStore.selectedFilter.terms.join(' ')}
        />
      </div>
    );
  });
};

const microsoftLearnSearchStyles = ({ theme }: IThemeOnlyProps): MicrosoftLearnSearchStyles => ({
  root: [
    {
      paddingRight: theme.spacing.s1,
      display: 'flex',
      alignItems: 'center'
    }
  ],
  label: [inputLabelStyle({ theme })],
  searchBox: [
    {
      width: '100%',
      marginLeft: `calc(${theme.spacing.l2}*2)`
    }
  ]
});

export const MicrosoftLearnSearch = styled(MicrosoftLearnSearchInner, microsoftLearnSearchStyles);
