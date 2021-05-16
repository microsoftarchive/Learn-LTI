/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import React, { useState, useEffect } from 'react';
import { SimpleComponentStyles } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { Text } from '@fluentui/react';
import { useObserver } from 'mobx-react-lite';
import { SearchBox } from '@fluentui/react';
import { FilterComponentProps } from './MicrosoftLearnFilterComponentProps';
import { getDisplayFromSearch } from './MicrosoftLearnFilterUtils';
import { getRegexs } from './MicrosoftLearnFilterCore';
import { MicrosoftLearnFilterItem } from './MicrosoftLearnFilterItem';
import { useStore } from '../../Stores/Core';

export type MicrosoftLearnFilterStyles = SimpleComponentStyles<'root'>;

const FilterComponentInner = (props: FilterComponentProps): JSX.Element => {
  const learnStore = useStore('microsoftLearnStore');
  const [filterSearchTerm, setFilterSearchTerm] = useState('');
  const [displayOptions, setDisplayOptions] = useState(props.filterOption);

  useEffect(() => {
    const filterBySearchTerm = (stringExp: string): void => {
      if (stringExp && stringExp?.trim() !== '' && props.filterOption) {
        const regexs: RegExp[] = getRegexs(stringExp);
        const filteresDisplay = getDisplayFromSearch(regexs, props.filterOption);
        setDisplayOptions(filteresDisplay);
      } else {
        setDisplayOptions(props.filterOption);
      }
    };
    filterBySearchTerm(filterSearchTerm || '');
  }, [props.filterOption, filterSearchTerm]);

  return useObserver(() => {
    if (props.filterOption == null) {
      return <div></div>;
    }

    const displayOptionsKeys = displayOptions ? Array.from(displayOptions.keys()) : [];
    return (
      <div className={props.styles.root?.toString()}>
        <form>
          <Text variant="medium" className={props.styles.title?.toString()}>
            {props.filterName}
          </Text>
          {props.search && (
            <SearchBox
              className={props.styles.search?.toString()}
              type="text"
              value={filterSearchTerm}
              onChange={(event, _newValue) => setFilterSearchTerm(_newValue || '')}
              disabled={!!learnStore.isLoadingCatalog}
              placeholder={`Find a ${props.filterName.toLowerCase().substring(0, props.filterName.length - 1)}`}
            />
          )}

          <div className={props.styles.optionsList?.toString()}>
            {displayOptionsKeys.length > 0
              ? displayOptionsKeys.map((item, i) => (
                  <MicrosoftLearnFilterItem
                    key={i}
                    mainItem={item}
                    filterType={props.filterType}
                    subItems={displayOptions?.get(item)}
                    mainItemClickHandler={props.mainItemClickHandler}
                    subItemClickHandler={props.subItemClickHandler}
                    styles={props.styles}
                  />
                ))
              : learnStore.isLoadingCatalog
              ? ''
              : 'No results'}
          </div>
        </form>
      </div>
    );
  });
};

export const MicrosoftLearnFilterComponent = FilterComponentInner;
