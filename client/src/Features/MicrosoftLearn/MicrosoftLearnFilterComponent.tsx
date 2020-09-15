import React, { useState, useEffect } from 'react';
import { SimpleComponentStyles } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { Text } from '@fluentui/react';
// import { themedClassNames } from '../../Core/Utils/FluentUI';
// import { FixedSizeList } from 'react-window';
// import AutoSizer from 'react-virtualized-auto-sizer';
import { useObserver } from 'mobx-react-lite';
import { FIXED_ITEM_HEIGHT } from './MicrosoftLearnStyles';
import { SearchBox } from '@fluentui/react';
import { FilterComponentProps } from './MicrosoftLearnFilterComponentProps' 
import { getRegexs, getDisplayFromSearch } from './MicrosoftLearnFilterUtils'
import { MicrosoftLearnFilterItem } from './MicrosoftLearnFilterItem';
import { useStore } from '../../Stores/Core';

export type MicrosoftLearnFilterStyles = SimpleComponentStyles<'root'>;


const FilterComponentInner = (props: FilterComponentProps): JSX.Element=>{
    const learnStore = useStore('microsoftLearnStore');
    const [filterSearchTerm, setFilterSearchTerm] = useState('');
    const [displayOptions, setDisplayOptions] = useState(props.filterOption);

    useEffect(() => {

        const filterBySearchTerm = (stringExp: string) => {
            if(stringExp && stringExp?.trim()!==""){
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

        setDisplayOptions(props.filterOption);  
        filterBySearchTerm(filterSearchTerm || "");      
    }, [props.filterOption, filterSearchTerm])

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
                        }}
                        disabled={!!learnStore.isLoadingCatalog}
                        // style={{display: props.search? "span" : "none"}}
                        //   className={classes.searchBox}
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


// const microsoftLearnFilterStyles = ({ theme }: IThemeOnlyProps): MicrosoftLearnFilterStyles => ({
//     root: [
//         {
//         //   paddingRight: theme.spacing.s1,
//           display: 'block',
//           float: 'left',
//           height: FIXED_ITEM_HEIGHT,
//           overflow:'scroll'
//         }
//       ]

// })

export const MicrosoftLearnFilterComponent = FilterComponentInner;