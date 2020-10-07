import { useStore } from '../../Stores/Core';
import { useObserver } from 'mobx-react-lite';
import React from 'react';
import {
  getProductsToDisplay,
  getTypesToDisplay,
  getLevelsToDisplay,
  getRolesToDisplay
} from './MicrosoftLearnFilterUtils';
import { FilterType } from '../../Models/Learn/FilterType.model';
import { MicrosoftLearnFilterComponent } from './MicrosoftLearnFilterComponent';
import { FontWeights } from '@fluentui/react';
import { IThemeOnlyProps, SimpleComponentStyles } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { themedClassNames } from '../../Core/Utils/FluentUI';

export type FilterComponentStyles = SimpleComponentStyles<
  'root' | 'title' | 'search' | 'optionsList' | 'subOptionsList' | 'filterItem'
>;

type FilterComponentTypes = FilterType.products | FilterType.roles | FilterType.levels | FilterType.types;

export const FilterComponent = (props: { type: FilterComponentTypes; name: string }) => {
  const { filterStore, catalog } = useStore('microsoftLearnStore');
  console.log(filterStore.selectedFilter);
  return useObserver(() => {
    const displayOptions =
      props.type === FilterType.products
        ? getProductsToDisplay(filterStore.displayFilter[FilterType.products], catalog?.products)
        : props.type === FilterType.levels
        ? getLevelsToDisplay(filterStore.displayFilter[props.type], catalog?.levels)
        : props.type === FilterType.roles
        ? getRolesToDisplay(filterStore.displayFilter[props.type], catalog?.roles)
        : getTypesToDisplay(filterStore.displayFilter[props.type]);
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
      display: window.innerWidth > 768 ? 'block' : 'none'
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
      maxHeight: window.innerWidth > 768 ? '260px' : '85%',
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
      margin: `4px 4px`,
      selectors: {
        '.collapseSubMenuIcon': {
          display: 'inline',
          height: 'max-content'
        }
      }
    }
  ]
});
