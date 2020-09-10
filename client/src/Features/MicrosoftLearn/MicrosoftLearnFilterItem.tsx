import { FilterItemProps } from "./MicrosoftLearnFilterComponentProps";
import { useStore } from "../../Stores/Core";
import { useState } from "react";
import { useObserver } from "mobx-react-lite";
import React from "react";


const FilterItemInner = (props: FilterItemProps) =>{

    const learnStore = useStore('microsoftLearnStore');
    let _n_subItems = props.subItems? props.subItems.length : 0;
    const itemInSelectedFilter = (subItemId: string | undefined) =>{
        let selectedFilters = learnStore.selectedFilters.get(props.filterType);
        return subItemId? selectedFilters?.includes(subItemId) : false;
    }
    // const childInSelectedFilter = (subItems: FilterOption[] | undefined) => {
    //     var flag = false;
    //     subItems?.forEach((item) => {                      
    //         if(item && itemInSelectedFilter(item.id) && !itemInSelectedFilter(props.mainItem?.id)){                
    //             flag=true;
    //             return true;
    //         }
    //     })
    //     return flag;  
    // }
    const [collapseSubItems, setCollapseSubItems] = useState(false);

    return useObserver(() => {

    return(
    <div>
        <button 
            style = {{display: _n_subItems > 0? 'inline-block': 'none' }}
            onClick = {(event)=>{
            event.preventDefault();
            setCollapseSubItems(!collapseSubItems);
        }}>
            v
        </button>

        {/* check the main item when all subitems selected, and vice versa.*/}
        <input 
        type="checkbox" 
        value = {props.mainItem?.id}
        onClick = {props.mainItemClickHandler}
        checked = {itemInSelectedFilter(props.mainItem?.id)}
        />
        {props.mainItem?.name}

        {/* subitems */}

        <div style={{display:  collapseSubItems? 'block' : 'none' }}>
        {props.subItems?.map(subItem => 
        <span style={{display:'block'}}>

    <input 
        type="checkbox" 
        value={subItem?.id}
        onClick={(event)=>{
            if(props.subItemClickHandler){
                props.subItemClickHandler(event);
            }            
                setCollapseSubItems(true);                
        }}
        checked={itemInSelectedFilter(subItem?.id) || itemInSelectedFilter(props.mainItem?.id)}
        disabled={itemInSelectedFilter(props.mainItem?.id)}
    />
    {subItem?.name}
    </span>
    )}
        </div>
     </div>


    )
})
}

export const MicrosoftLearnFilterItem = FilterItemInner