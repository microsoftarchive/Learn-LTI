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
import { MicrosoftLearnFilterComponent } from './MicrosoftLearnFilterComponent';
import { LearnTypeFilterOption, FilterOption } from './MicrosoftLearnFilterComponentProps';
import { RoleDto, LevelDto } from '../../Dtos/Learn';
import _, { set, intersection } from 'lodash';
import { getProductsToDisplay, getRolesToDisplay, getLevelsToDisplay, getDisplayFilterTags, getTypesToDisplay } from './MicrosoftLearnFilterUtils';
import { MicrosoftLearnFilterTags } from './MicrosoftLearnFilterTags';

const FilterPaneInner = ()=>{

    const learnStore = useStore('microsoftLearnStore');
    const isLoadingCatalog = !!learnStore.isLoadingCatalog;
    const catalog = learnStore.catalog;
    const catalogContent = learnStore.filteredCatalogContent;
    const noVisibleFilter = !isLoadingCatalog && catalogContent?.length === 0;
    const displayFilters = learnStore.displayFilters;

    
    return useObserver(() => {
        const displayProducts = getProductsToDisplay(displayFilters.get(FilterType.Product), catalog?.products)    
        const displayRoles = getRolesToDisplay(displayFilters.get(FilterType.Role), catalog?.roles);
        const displayLevels = getLevelsToDisplay(displayFilters.get(FilterType.Level), catalog?.levels)
        const displayTypes = getTypesToDisplay(displayFilters.get(FilterType.Type))        

        return(
            <div>
                FILTERS {learnStore.filteredCatalogContent?.length}
                {noVisibleFilter? 
                <Text>Oops No filters available</Text>
                :
                (        
                <div>        
                    <MicrosoftLearnFilterTags />         
                    <MicrosoftLearnFilterComponent
                        filterType={FilterType.Product}
                        filterName="Products"
                        filterOption={displayProducts}
                        search={true}
                        mainItemClickHandler={(event)=>{                    
                            let target = event.target as HTMLInputElement
                            let subItems = []
                            const iter = learnStore.catalog?.products.values();
                            let _n = 0;

                            while(learnStore.catalog && _n<learnStore.catalog?.products.size){
                                let product = iter?.next().value;
                                if(product.parentId && product.parentId==target.value){
                                    subItems.push(product.id);
                                }
                                _n=_n+1;
                            }
                                
                            let type = FilterType.Product
                            target.checked? learnStore.addFilter(type, [...subItems, target.value]) 
                            : learnStore.removeFilter(type, [...subItems, target.value]);

                        }}
                        subItemClickHandler={(event)=>{
                            let target = event?.target as HTMLInputElement
                            let type = FilterType.Product
                            target.checked? learnStore.addFilter(type, [target.value]) : learnStore.removeFilter(type, [target.value]);  
                        }}
                        />
                    <br />
                    <MicrosoftLearnFilterComponent  
                        filterType={FilterType.Role}
                        filterName="Roles"
                        filterOption={displayRoles}
                        search={true}
                        mainItemClickHandler={(event) => {
                            let target = event?.target as HTMLInputElement
                            let type = FilterType.Role
                            target.checked? learnStore.addFilter(type, [target.value]) : learnStore.removeFilter(type, [target.value]);  
                        }}
                        subItemClickHandler={(event)=>{
                        }}                
                    />
                    <br />
                    <MicrosoftLearnFilterComponent  
                        filterType={FilterType.Level}
                        filterName="Levels"
                        filterOption={displayLevels}
                        search={false}
                        mainItemClickHandler={(event)=>{
                            let target = event?.target as HTMLInputElement
                            let type = FilterType.Level
                            target.checked? learnStore.addFilter(type, [target.value]) : learnStore.removeFilter(type, [target.value]);  
                        }}
                        subItemClickHandler={(event)=>{
                        }}                
                    />
                    <br />
                    <MicrosoftLearnFilterComponent  
                        filterType={FilterType.Type}
                        filterName="Types"
                        filterOption={displayTypes}
                        search={false}
                        mainItemClickHandler={(event)=>{
                            let target = event?.target as HTMLInputElement
                            let type = FilterType.Type
                            target.checked? learnStore.addFilter(type, [target.value]) : learnStore.removeFilter(type, [target.value]);  
                        }}
                        subItemClickHandler={(event)=>{
                        }}                
                    />
                </div>
                )}
            </div>
        )

    })
}

export const MicrosoftLearnFilterPane = FilterPaneInner;