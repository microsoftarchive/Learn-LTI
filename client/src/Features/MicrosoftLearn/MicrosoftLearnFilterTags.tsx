import React from 'react';
// import { SimpleComponentStyles, IStylesOnly, IThemeOnlyProps } from '../../Core/Utils/FluentUI/typings.fluent-ui';
// import { styled, Text, FontIcon } from '@fluentui/react';
// import { themedClassNames } from '../../Core/Utils/FluentUI';
import { useStore } from '../../Stores/Core';
// import { FixedSizeList } from 'react-window';
// import AutoSizer from 'react-virtualized-auto-sizer';
import { useObserver } from 'mobx-react-lite';
// import { FIXED_ITEM_HEIGHT, FIXED_ITEM_WIDTH } from './MicrosoftLearnStyles';
import { FilterType } from '../../Models/Learn/FilterType.model'; 
import {  getDisplayFilterTags } from './MicrosoftLearnFilterUtils';


const FilterTagsInner = () => {

    const learnStore = useStore('microsoftLearnStore');
    const productsMap = learnStore.productMap;
    const filter = learnStore.filter;
    return useObserver(()=>{
        const tagMap: Map<FilterType, string[]> = getDisplayFilterTags(filter.displayFilters, filter.selectedFilters, productsMap);

        return (
            <div>Selected Filters: 
                        
            {Array.from(tagMap.keys()).map(key => 
            (
            <div>                         
              {tagMap.get(key)?.map(tag => 
                  (<span>
                      {tag}
                      <br/>
                  </span>)  
              )}
              </div>  
            )
            )}                                            
        </div>  
        )
    })
}

export const MicrosoftLearnFilterTags = FilterTagsInner