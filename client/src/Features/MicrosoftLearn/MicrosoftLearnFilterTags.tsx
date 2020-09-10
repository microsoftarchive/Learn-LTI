import React, { CSSProperties, useState, useEffect } from 'react';
import { SimpleComponentStyles, IStylesOnly, IThemeOnlyProps } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { styled, Text, FontIcon } from '@fluentui/react';
import { themedClassNames } from '../../Core/Utils/FluentUI';
import { useStore } from '../../Stores/Core';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useObserver } from 'mobx-react-lite';
import { FIXED_ITEM_HEIGHT, FIXED_ITEM_WIDTH } from './MicrosoftLearnStyles';
import { toMap } from '../../Core/Utils/Typescript/ToMap';
import { Catalog, Product, Role, Level, LearnType, LearnContent } from '../../Models/Learn';
import { FilterType } from '../../Models/Learn/FilterType.model'; 
import { observable } from 'mobx';
import { MicrosoftLearnFilterComponent} from './MicrosoftLearnFilterComponent';
import { LearnTypeFilterOption, FilterOption } from './MicrosoftLearnFilterComponentProps';
import { RoleDto, LevelDto } from '../../Dtos/Learn';
import _, { set, intersection } from 'lodash';
import { getProductsToDisplay, getRolesToDisplay, getLevelsToDisplay, getDisplayFilterTags, getTypesToDisplay } from './MicrosoftLearnFilterUtils';


const FilterTagsInner = () => {

    const learnStore = useStore('microsoftLearnStore');
    const displayFilters = learnStore.displayFilters;
    const selectedFilters = learnStore.selectedFilters;
    const productsMap = learnStore.productMap;

    return useObserver(()=>{
        const tagMap: Map<FilterType, string[]> = getDisplayFilterTags(displayFilters, selectedFilters, productsMap);

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