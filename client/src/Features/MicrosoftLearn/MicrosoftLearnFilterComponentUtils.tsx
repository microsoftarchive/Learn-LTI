import { useStore } from '../../Stores/Core';
import { useObserver } from 'mobx-react-lite';
import React from 'react';
import {
  getProductsToDisplay,
  getRolesToDisplay,
  getLevelsToDisplay,
  getTypesToDisplay
} from './MicrosoftLearnFilterUtils';
import { FilterType } from '../../Models/Learn/FilterType.model';
import { MicrosoftLearnFilterComponent } from './MicrosoftLearnFilterComponent';
import { FontWeights } from '@fluentui/react';
import { IThemeOnlyProps, SimpleComponentStyles } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { themedClassNames } from '../../Core/Utils/FluentUI';

export type FilterComponentStyles = SimpleComponentStyles<
  'root' | 'title' | 'search' | 'optionsList' | 'subOptionsList' | 'filterItem'
>;

export const ProductFilterComponent = () => {
  const { filterStore, catalog } = useStore('microsoftLearnStore');

  return useObserver(() => {
    const displayProducts = getProductsToDisplay(filterStore.displayFilter[FilterType.products], catalog?.products);
    return (
      <>
        <MicrosoftLearnFilterComponent
          styles={themedClassNames(FilterComponentStyles)}
          filterType={FilterType.products}
          filterName="Products"
          filterOption={displayProducts}
          search={true}
          mainItemClickHandler={event => {
            let target = event?.target as HTMLInputElement;
            let value = target.getAttribute('aria-describedby');
            if (value) {
              let subItems: string[] = [...catalog?.products.values()]
                .filter(product => product.parentId && product.parentId === value)
                .map(product => product.id);
              let type = FilterType.products;
              target.checked
                ? filterStore.addFilter(type, [...subItems, value])
                : filterStore.removeFilter(type, [...subItems, value]);
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
  });
};

export const RoleFilterComponent = () => {
  const { filterStore, catalog } = useStore('microsoftLearnStore');

  return useObserver(() => {
    const displayRoles = getRolesToDisplay(filterStore.displayFilter[FilterType.roles], catalog?.roles);
    return (
      <>
        <MicrosoftLearnFilterComponent
          styles={themedClassNames(FilterComponentStyles)}
          filterType={FilterType.roles}
          filterName="Roles"
          filterOption={displayRoles}
          search={true}
          mainItemClickHandler={event => {
            let target = event?.target as HTMLInputElement;
            let type = FilterType.roles;
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
  });
};

export const LevelFilterComponent = () => {
  const { filterStore, catalog } = useStore('microsoftLearnStore');

  return useObserver(() => {
    const displayLevels = getLevelsToDisplay(filterStore.displayFilter[FilterType.levels], catalog?.levels);
    return (
      <>
        <MicrosoftLearnFilterComponent
          styles={themedClassNames(FilterComponentStyles)}
          filterType={FilterType.levels}
          filterName="Levels"
          filterOption={displayLevels}
          search={false}
          mainItemClickHandler={event => {
            let target = event?.target as HTMLInputElement;
            let type = FilterType.levels;
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
  });
};

export const TypeFilterComponent = () => {
  const { filterStore } = useStore('microsoftLearnStore');

  return useObserver(() => {
    const displayTypes = getTypesToDisplay(filterStore.displayFilter[FilterType.types]);
    return (
      <>
        <MicrosoftLearnFilterComponent
          styles={themedClassNames(FilterComponentStyles)}
          filterType={FilterType.types}
          filterName="Types"
          filterOption={displayTypes}
          search={false}
          mainItemClickHandler={event => {
            let target = event?.target as HTMLInputElement;
            let type = FilterType.types;
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
