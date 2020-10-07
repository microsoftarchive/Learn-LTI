/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { FilterItemProps } from './MicrosoftLearnFilterComponentProps';
import { useStore } from '../../Stores/Core';
import { useObserver } from 'mobx-react-lite';
import { Checkbox, ActionButton } from '@fluentui/react';
import React from 'react';

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

  return useObserver(() => {
    return (
      <div>
        <span className={props.styles.filterItem?.toString()}>
          <ActionButton
            iconProps={{ iconName: inExpanded(props.mainItem?.id) ? 'ChevronUpMed' : 'ChevronDownMed' }}
            className="collapseSubMenuIcon"
            style={{ color: nSubItems === 0 ? 'white' : '#605E5C' }}
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

export const MicrosoftLearnFilterItem = FilterItemInner;
