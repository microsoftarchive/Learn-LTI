import { FilterItemProps } from "./MicrosoftLearnFilterComponentProps";
import { useStore } from "../../Stores/Core";
import { useState } from "react";
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
        if(oldState===true){
            learnStore.filter.expandedProducts = learnStore.filter.expandedProducts.filter(i => i!==props.mainItem?.id); 
        }
        else if(oldState!==undefined && props.mainItem?.id){
            learnStore.filter.expandedProducts.push(props.mainItem?.id)
        }
    }

    const inExpanded = (id: string | undefined)=>{
        return id && learnStore.filter.expandedProducts.includes(id)
    }
    const [collapseSubItems, setCollapseSubItems] = useState(inExpanded(props.mainItem?.id));

    return useObserver(() => {

    return(
    <div>

<span style={{display:'flex', flexDirection: 'row', alignItems: 'center', margin: `4px 4px`}}>
        <ActionButton
        iconProps={{iconName: collapseSubItems? 'ChevronUpMed':'ChevronDownMed' }}
        style = {{display: 'inline',
                  color: _n_subItems===0? 'white' : '#605E5C',
                  height: 'max-content'    
                }}
        onClick = {(event)=>{
        event.preventDefault();
        let previous = collapseSubItems
        setCollapseSubItems(!collapseSubItems);
        updateExpandedSet(previous);
        console.log("expanded:", learnStore.filter.expandedProducts, collapseSubItems);
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
        <div style={{display:  collapseSubItems? 'block' : 'none' }}>
        {props.subItems?.map(subItem => 
        <span style={{display:'block', margin: `4px 4px` }}>

            <Checkbox
            value={subItem?.id}
            onChange={(event)=>{
                
                if(props.subItemClickHandler!=null){
                    props.subItemClickHandler(event)
                    setCollapseSubItems(true);
                }
            }
            }
            checked={itemInSelectedFilter(subItem?.id) || itemInSelectedFilter(props.mainItem?.id)}
            disabled={itemInSelectedFilter(props.mainItem?.id)}
            label = {subItem?.name}
            ariaDescribedBy = {subItem?.id}
            >
            </Checkbox>

    </span>
    )}
        </div>
     </div>
    )
})
}

export const MicrosoftLearnFilterItem = FilterItemInner