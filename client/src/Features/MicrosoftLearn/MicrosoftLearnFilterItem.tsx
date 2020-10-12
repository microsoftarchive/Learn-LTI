/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { FilterItemProps } from './MicrosoftLearnFilterComponentProps';
import { useStore } from '../../Stores/Core';
import { useObserver } from 'mobx-react-lite';
import {
  Checkbox,
  ActionButton,
  classNamesFunction,
  getTheme,
  ITheme,
  ICheckboxStyles
} from '@fluentui/react';
import React from 'react';

interface SubItemNumberStyleProps {
  nSubItems: Number;
  theme: ITheme;
}

const FilterItemInner = (props: FilterItemProps) => {
  const { filterStore } = useStore('microsoftLearnStore');

  const itemInSelectedFilter = (subItemId: string | undefined) => {
    let selectedFilters = filterStore.selectedFilter[props.filterType];
    return subItemId ? selectedFilters?.includes(subItemId) : false;
  };

  let nSubItems = props.subItems ? props.subItems.length : 0;

  const updateExpandedSet = () => {
    if (props.mainItem?.id && inExpanded(props.mainItem?.id)) {
      filterStore.collapseProducts(props.mainItem?.id);
    } else if (props.mainItem?.id) {
      filterStore.expandProducts(props.mainItem?.id);
    }
  };

  const inExpanded = (id: string | undefined) => {
    return id && filterStore.expandedProducts.includes(id);
  };

  const checkboxClassName = classNamesFunction<SubItemNumberStyleProps, ICheckboxStyles>()(mainCheckboxStyles, {
    nSubItems,
    theme: getTheme()
  });

  return useObserver(() => {
    return (
      <div>
        <span className={props.styles.filterItem?.toString()}>
          <ActionButton
            iconProps={{ iconName: inExpanded(props.mainItem?.id) ? 'ChevronUpMed' : 'ChevronDownMed' }}
            className="collapseSubMenuIcon"
            style={{ display: nSubItems === 0 ? 'none' : 'inline' }}
            onClick={event => {
              event.preventDefault();
              updateExpandedSet();
            }}
            disabled={nSubItems === 0}
          />

          <Checkbox
            value={props.mainItem?.id}
            ariaDescribedBy={props.mainItem?.id}
            checked={itemInSelectedFilter(props.mainItem?.id)}
            onChange={event => {
              if (props.mainItemClickHandler != null) {
                props.mainItemClickHandler(event);
              }
            }}
            label={props.mainItem?.name}
            styles={checkboxClassName}
          />
        </span>
        <div
          style={{ display: inExpanded(props.mainItem?.id) ? 'block' : 'none' }}
          className={props.styles.subOptionsList?.toString()}
        >
          {props.subItems?.map(subItem => (
            <span className={props.styles.filterItem?.toString()}>
              <Checkbox
                value={subItem?.id}
                onChange={event => {
                  if (props.subItemClickHandler != null) {
                    props.subItemClickHandler(event);
                  }
                }}
                checked={itemInSelectedFilter(subItem?.id) || itemInSelectedFilter(props.mainItem?.id)}
                disabled={itemInSelectedFilter(props.mainItem?.id)}
                label={subItem?.name}
                ariaDescribedBy={subItem?.id}
              />
            </span>
          ))}
        </div>
      </div>
    );
  });
};

const mainCheckboxStyles = ({ nSubItems, theme }: SubItemNumberStyleProps): Partial<ICheckboxStyles> => ({
  root: [
    {
      paddingLeft: nSubItems > 0 ? '0px' : `calc(${theme.spacing.l1}*1.7)`
    }
  ]
});

export const MicrosoftLearnFilterItem = FilterItemInner;