/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import React, { useEffect, useState } from 'react';
import { IThemeOnlyProps, SimpleComponentStyles, IStylesOnly } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { styled, SearchBox, Label, DefaultButton } from '@fluentui/react';
import { themedClassNames } from '../../Core/Utils/FluentUI';
import { inputLabelStyle } from '../../Core/Components/Common/Inputs/EdnaInputStyles';
import { useStore } from '../../Stores/Core';
import { useObserver } from 'mobx-react-lite';
import { useHistory } from 'react-router-dom';


export type MicrosoftLearnSearchStyles = SimpleComponentStyles<'root' | 'label' | 'searchBox' | 'searchButton'>;

const MicrosoftLearnSearchInner = ({ styles }: IStylesOnly<MicrosoftLearnSearchStyles>): JSX.Element => {
  const learnStore = useStore('microsoftLearnStore');
  const { filterStore, isLoadingCatalog } = learnStore;
  const [searchTerm, setSearchTerm] = useState(filterStore.selectedFilter.terms.join(' '));

  useEffect(() => {
    setSearchTerm(filterStore.selectedFilter.terms.join(' '));
  }, [filterStore.selectedFilter])

  let history = useHistory();

  const classes = themedClassNames(styles);
  return useObserver(() => {
    return (
      <div className={classes.root}>
        <Label className={classes.label}>Search</Label>
        <SearchBox
          onChange={(_e, newValue)=>setSearchTerm(newValue || '')}
          className={classes.searchBox}
          disabled={!!isLoadingCatalog}
          value={searchTerm.length? searchTerm : filterStore.selectedFilter.terms.join(' ') }
        />
        <DefaultButton
        iconProps={{iconName:'Search'}}
        text="Search"
        className={classes.searchButton}
        onClick={()=>{
          filterStore.updateSearchTerm(searchTerm || '', history);
        }}
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
  ],
  searchButton:[
    {
      backgroundColor: theme.palette.themeDark,
      color:'white'

    }
  ]
});

export const MicrosoftLearnSearch = styled(MicrosoftLearnSearchInner, microsoftLearnSearchStyles);
