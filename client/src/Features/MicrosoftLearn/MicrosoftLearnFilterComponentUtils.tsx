import { useStore } from "../../Stores/Core";
import { useObserver } from 'mobx-react-lite';
import React from 'react';
import { getProductsToDisplay, getRolesToDisplay, getLevelsToDisplay, getTypesToDisplay } from './MicrosoftLearnFilterUtils';
import { FilterType } from "../../Models/Learn/FilterType.model";
import { MicrosoftLearnFilterComponent } from "./MicrosoftLearnFilterComponent";
import { FontWeights } from "@fluentui/react";
import { IThemeOnlyProps, SimpleComponentStyles } from "../../Core/Utils/FluentUI/typings.fluent-ui";
import { themedClassNames } from "../../Core/Utils/FluentUI";

export type FilterComponentStyles = SimpleComponentStyles<'root' | 'title' | 'search' | 'optionsList' | 'subOptionsList' | 'filterItem'>;

export const ProductFilterComponent = () => {
    const learnStore = useStore('microsoftLearnStore');
    const catalog = learnStore.catalog;

    return useObserver(()=>{
        const displayProducts = getProductsToDisplay(learnStore.microsoftLearnFilterStore.displayFilters.get(FilterType.Product), catalog?.products)    
        return (
            <>
                <MicrosoftLearnFilterComponent
                    styles={themedClassNames(FilterComponentStyles)}
                    filterType={FilterType.Product}
                    filterName="Products"
                    filterOption={displayProducts}
                    search={true}
                    mainItemClickHandler={(event)=>{                    
                        let target = event?.target as HTMLInputElement
                        let value = target.getAttribute('aria-describedby');
                        if(value){
                        let subItems: string[] = [...learnStore.catalog?.products.values()].filter(product => product.parentId && product.parentId===value)
                                                                                        .map(product => product.id);
                        let type = FilterType.Product
                        target.checked? learnStore.microsoftLearnFilterStore.addFilter(type, [...subItems, value]) 
                        : learnStore.microsoftLearnFilterStore.removeFilter(type, [...subItems, value]);
                        }
                    }}
                    subItemClickHandler={(event)=>{
                        let target = event?.target as HTMLInputElement
                        let type = FilterType.Product
                        let value = target.getAttribute('aria-describedby')
                        if(target.checked && value){
                            learnStore.microsoftLearnFilterStore.addFilter(type, [value])                                    
                        }
                        else if(!target.checked && value){
                            learnStore.microsoftLearnFilterStore.removeFilter(type, [value])
                        }                                                         
                    }}
                />
            </>
        )
    })
}

export const RoleFilterComponent = () => {

    const learnStore = useStore('microsoftLearnStore');
    const catalog = learnStore.catalog;

    return useObserver(()=>{
        const displayRoles = getRolesToDisplay(learnStore.microsoftLearnFilterStore.displayFilters.get(FilterType.Role), catalog?.roles);
        return (
            <>
                <MicrosoftLearnFilterComponent  
                    styles={themedClassNames(FilterComponentStyles)}
                    filterType={FilterType.Role}
                    filterName="Roles"
                    filterOption={displayRoles}
                    search={true}
                    mainItemClickHandler={(event) => {
                        let target = event?.target as HTMLInputElement
                        let type = FilterType.Role
                        let value = target.getAttribute('aria-describedby')
                        if(target.checked && value){
                            learnStore.microsoftLearnFilterStore.addFilter(type, [value])                                    
                        }
                        else if(!target.checked && value){
                            learnStore.microsoftLearnFilterStore.removeFilter(type, [value])
                        }
                    }}              
                />
            </>
        )
    })
}

export const LevelFilterComponent = () => {

    const learnStore = useStore('microsoftLearnStore');
    const catalog = learnStore.catalog;

    return useObserver(()=>{
        const displayLevels = getLevelsToDisplay(learnStore.microsoftLearnFilterStore.displayFilters.get(FilterType.Level), catalog?.levels)
        return (
            <>
                <MicrosoftLearnFilterComponent  
                    styles={themedClassNames(FilterComponentStyles)}
                    filterType={FilterType.Level}
                    filterName="Levels"
                    filterOption={displayLevels}
                    search={false}
                    mainItemClickHandler={(event)=>{
                        let target = event?.target as HTMLInputElement
                        let type = FilterType.Level
                        let value = target.getAttribute('aria-describedby')
                        if(target.checked && value){
                            learnStore.microsoftLearnFilterStore.addFilter(type, [value])                                    
                        }
                        else if(!target.checked && value){
                            learnStore.microsoftLearnFilterStore.removeFilter(type, [value])
                        }                        
                    }}             
                />
            </>
        )
    })
}

export const TypeFilterComponent = () =>{

    const learnStore = useStore('microsoftLearnStore');

    return useObserver(()=>{
        const displayTypes = getTypesToDisplay(learnStore.microsoftLearnFilterStore.displayFilters.get(FilterType.Type))        
        return (
            <>
                <MicrosoftLearnFilterComponent  
                    styles={themedClassNames(FilterComponentStyles)}
                    filterType={FilterType.Type}
                    filterName="Types"
                    filterOption={displayTypes}
                    search={false}
                    mainItemClickHandler={(event)=>{
                        let target = event?.target as HTMLInputElement
                        let type = FilterType.Type
                        let value = target.getAttribute('aria-describedby')
                        if(target.checked && value){
                            learnStore.microsoftLearnFilterStore.addFilter(type, [value])                                    
                        }
                        else if(!target.checked && value){
                            learnStore.microsoftLearnFilterStore.removeFilter(type, [value])
                        }                        
                    }}
                />
            </>
        )
    })
}

const FilterComponentStyles = ({ theme }: IThemeOnlyProps): FilterComponentStyles => ({
    root: [
        {
            marginBottom:theme.spacing.l1
        }
      ],
    title: [
        {
            color: theme.palette.neutralPrimary,
            fontWeight: FontWeights.semibold, 
            display: window.innerWidth>768? 'block': 'none'            
        }
    ],
    search: [
        {
            marginTop: `calc(${theme.spacing.s1}*2)`
        }
    ],
    optionsList: [
        {
            width:'260px',
            height:'max-content',
            maxHeight: window.innerWidth>768? '260px': '85%',
            overflowY:'auto', 
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
            display:'flex', 
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

})
