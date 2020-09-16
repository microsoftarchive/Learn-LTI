import { FilterItemProps } from "./MicrosoftLearnFilterComponentProps";
import { useStore } from "../../Stores/Core";
import { useObserver } from "mobx-react-lite";
import { Checkbox, ActionButton } from '@fluentui/react';
import React from "react";


const FilterItemInner = (props: FilterItemProps) =>{
    const learnStore = useStore('microsoftLearnStore');

    const itemInSelectedFilter = (subItemId: string | undefined) =>{
        let selectedFilters = learnStore.filter.selectedFilters.get(props.filterType);
        return subItemId? selectedFilters?.includes(subItemId) : false;
    }

    let _n_subItems = props.subItems? props.subItems.length  : 0;

    const updateExpandedSet = (oldState: boolean | undefined | "") =>{
        if(oldState===true && props.mainItem?.id){
            learnStore.filter.updateExpandedProducts(false, props.mainItem?.id);
        }
        else if(oldState!==undefined && props.mainItem?.id){
            learnStore.filter.updateExpandedProducts(true, props.mainItem?.id);
        }
    }

    const inExpanded = (id: string | undefined)=>{
        return id && learnStore.filter.expandedProducts.includes(id);
    }

    return useObserver(() => {
        return(
        <div>
            <span style={{display:'flex', flexDirection: 'row', alignItems: 'center', margin: `4px 4px`}}>
                <ActionButton
                iconProps={{iconName: inExpanded(props.mainItem?.id)? 'ChevronUpMed':'ChevronDownMed' }}
                style = {{display: 'inline',
                        color: _n_subItems===0? 'white' : '#605E5C',
                        height: 'max-content'    
                        }}
                onClick = {(event)=>{
                event.preventDefault();
                let previous = inExpanded(props.mainItem?.id)
                updateExpandedSet(previous);
                }}
                disabled = {_n_subItems===0}        
                />
                <Checkbox
                value={props.mainItem?.id}
                ariaDescribedBy={props.mainItem?.id}
                checked = {itemInSelectedFilter(props.mainItem?.id)}
                onChange = {(event)=>{            
                    if(props.mainItemClickHandler!=null){
                        props.mainItemClickHandler(event)
                    }
                    }}
                label = {props.mainItem?.name}
                style={{display:"inline", alignItems: 'center'}}
                />
            </span>
            <div style={{display:  inExpanded(props.mainItem?.id)? 'block' : 'none' }}>
            {props.subItems?.map(subItem => 
                <span style={{display:'block', margin: `4px 4px` }}>
                    <Checkbox
                    value={subItem?.id}
                    onChange={(event)=>{                
                        if(props.subItemClickHandler!=null){
                            props.subItemClickHandler(event)
                        }}
                    }
                    checked={itemInSelectedFilter(subItem?.id) || itemInSelectedFilter(props.mainItem?.id)}
                    disabled={itemInSelectedFilter(props.mainItem?.id)}
                    label = {subItem?.name}
                    ariaDescribedBy = {subItem?.id}
                    />
                </span>
            )}
            </div>
        </div>
        )
    })
}

export const MicrosoftLearnFilterItem = FilterItemInner