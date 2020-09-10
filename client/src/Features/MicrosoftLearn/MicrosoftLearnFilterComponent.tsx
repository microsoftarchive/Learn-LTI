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
import { Catalog, Product, Role, Level, LearnType } from '../../Models/Learn';
import { FilterType } from '../../Models/Learn/FilterType.model'; 
import { observable } from 'mobx';
import { RoleDto } from '../../Dtos/Learn';
import { intersection } from 'lodash';
import _, { set } from 'lodash';
import { SearchBox, Label } from '@fluentui/react';
import { FilterComponentProps, FilterItemProps, FilterOption } from './MicrosoftLearnFilterComponentProps' 
import { getRegexs, getDisplayFromSearch } from './MicrosoftLearnFilterUtils'
import { MicrosoftLearnFilterItem } from './MicrosoftLearnFilterItem';

export type MicrosoftLearnFilterStyles = SimpleComponentStyles<'root'>;


const FilterComponentInner = (props: FilterComponentProps): JSX.Element=>{

    const [filterSearchTerm, setFilterSearchTerm] = useState('');
    const [displayOptions, setDisplayOptions] = useState(props.filterOption);

    const filterBySearchTerm = (stringExp: string) => {
        if(stringExp && stringExp?.trim()!=""){
            let regexs: RegExp[] = getRegexs(stringExp);
            if(props.filterOption){
              let filteresDisplay =  getDisplayFromSearch(regexs, props.filterOption)
              setDisplayOptions(filteresDisplay);
            }
        }
        else{
            setDisplayOptions(props.filterOption);
        }
    }

    useEffect(() => {
        setDisplayOptions(props.filterOption);  
        filterBySearchTerm(filterSearchTerm || "");      
    }, [props])

    return useObserver(() => {
    if(props.filterOption==null) {
        return (
            <div>
            </div>
        );
    }

        return(    
            <div style={{height:0.75*FIXED_ITEM_HEIGHT, overflowY:'scroll'}}>
            <form>
            <Text> {props.filterName} </Text>
            {props.search?        
                (
                        <SearchBox
                            type="text"
                            value={filterSearchTerm}
                            onChange={(event, _newValue)=>{                
                            setFilterSearchTerm(_newValue || "");                
                            filterBySearchTerm(_newValue || "");                
                        }}
                        // style={{display: props.search? "span" : "none"}}
                        //   className={classes.searchBox}
                        //   disabled={!!learnStore.isLoadingCatalog}
                        />                
                ): 
                (
                        <span></span>
                )
            }
            {displayOptions? Array.from(displayOptions.keys()).map(item => <MicrosoftLearnFilterItem mainItem = {item}
                                                            filterType = {props.filterType}
                                                            subItems = {displayOptions.get(item)}
                                                            mainItemClickHandler = {props.mainItemClickHandler}
                                                            subItemClickHandler = {props.subItemClickHandler}                                                                        
                                                                />)                                                       
                                                            :
                                                            console.log("display options empty")
                                                            }                 
            </form>
            </div>
            
        )
})
}


const microsoftLearnFilterStyles = ({ theme }: IThemeOnlyProps): MicrosoftLearnFilterStyles => ({
    root: [
        {
        //   paddingRight: theme.spacing.s1,
          display: 'block',
          float: 'left',
          height: FIXED_ITEM_HEIGHT,
          overflow:'scroll'
        }
      ]

})

export const MicrosoftLearnFilterComponent = FilterComponentInner;