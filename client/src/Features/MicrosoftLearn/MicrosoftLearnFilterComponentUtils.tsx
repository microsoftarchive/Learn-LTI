/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { useStore } from '../../Stores/Core';
import { useObserver } from 'mobx-react-lite';
import React from 'react';
import { getProductsToDisplay, getFilterItemsToDisplay, TYPE_MAP } from './MicrosoftLearnFilterUtils';
import { FilterType } from '../../Models/Learn/FilterType.model';
import { MicrosoftLearnFilterComponent } from './MicrosoftLearnFilterComponent';
import { FontWeights } from '@fluentui/react';
import { IThemeOnlyProps, SimpleComponentStyles } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { themedClassNames } from '../../Core/Utils/FluentUI';
import { TAB_SCREEN_SIZE } from './MicrosoftLearnPage';

export type FilterComponentStyles = SimpleComponentStyles<
  'root' | 'title' | 'search' | 'optionsList' | 'subOptionsList' | 'filterItem'
>;

type FilterComponentTypes = FilterType.products | FilterType.roles | FilterType.levels | FilterType.types;

export const FilterComponent = (props: { type: FilterComponentTypes; name: string }) => {
  const { filterStore, catalog } = useStore('microsoftLearnStore');

  const getDisplayOptions = () => {
    switch (props.type) {
      case FilterType.products:
        return getProductsToDisplay(filterStore.displayFilter[props.type], catalog?.products);
      case FilterType.roles:
        return getFilterItemsToDisplay(filterStore.displayFilter[props.type], catalog?.roles);
      case FilterType.levels:
        return getFilterItemsToDisplay(filterStore.displayFilter[props.type], catalog?.levels);
      case FilterType.types:
        return getFilterItemsToDisplay(filterStore.displayFilter[props.type], TYPE_MAP);
    }
  };

  return useObserver(() => {
    const displayOptions = getDisplayOptions();
    if (props.type === FilterType.products) {
      return (
        <>
          <MicrosoftLearnFilterComponent
            styles={themedClassNames(FilterComponentStyles)}
            filterType={props.type}
            filterName={props.name}
            filterOption={displayOptions}
            search={true}
            mainItemClickHandler={event => {
              let target = event?.target as HTMLInputElement;
              let value = target.getAttribute('aria-describedby');
              if (value) {
                let subItems: string[] = [...catalog?.products.values()]
                  .filter(product => product.parentId && product.parentId === value)
                  .map(product => product.id);
                target.checked
                  ? filterStore.addFilter(props.type, [...subItems, value])
                  : filterStore.removeFilter(props.type, [...subItems, value]);
              }
            }}
            subItemClickHandler={event => {
              let target = event?.target as HTMLInputElement;
              let type = FilterType.products;
              let value = target.getAttribute('aria-describedby');
              if (target.checked && value) {
                filterStore.addFilter(type, [value]);
              } else if (!target.checked && value) {
                filterStore.removeFilter(type, [value]);
              }
            }}
          />
        </>
      );
    } else {
      return (
        <>
          <MicrosoftLearnFilterComponent
            styles={themedClassNames(FilterComponentStyles)}
            filterType={props.type}
            filterName={props.name}
            filterOption={displayOptions}
            search={props.type === FilterType.roles ? true : false}
            mainItemClickHandler={event => {
              let target = event?.target as HTMLInputElement;
              let value = target.getAttribute('aria-describedby');
              if (target.checked && value) {
                filterStore.addFilter(props.type, [value]);
              } else if (!target.checked && value) {
                filterStore.removeFilter(props.type, [value]);
              }
            }}
          />
        </>
      );
    }
  });
};

const FilterComponentStyles = ({ theme }: IThemeOnlyProps): FilterComponentStyles => ({
  root: [
    {
      marginBottom: theme.spacing.l1
    }
  ],
  title: [
    {
      color: theme.palette.neutralPrimary,
      fontWeight: FontWeights.semibold,
      display: window.innerWidth > TAB_SCREEN_SIZE ? 'block' : 'none'
    }
  ],
  search: [
    {
      marginTop: `calc(${theme.spacing.s1}*2)`
    }
  ],
  optionsList: [
    {
      width: '260px',
      height: 'max-content',
      maxHeight: window.innerWidth > TAB_SCREEN_SIZE ? '260px' : '85%',
      overflowY: 'auto',
      marginTop: `calc(${theme.spacing.s1}*2)`
    }
  ],

  subOptionsList: [
    {
      paddingLeft: `calc(${theme.spacing.l1}*3)`
    }
  ],
  filterItem: [
    {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      margin: theme.spacing.s2,
      selectors: {
        '.collapseSubMenuIcon': {
          display: 'inline',
          height: 'max-content',
          color: theme.palette.neutralDark,
          selectors: {
            ' i': {
              color: theme.palette.neutralDark
            }
          }
        }
      }
    }
  ]
});
