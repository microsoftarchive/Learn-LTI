import React from 'react';
import { useStore } from '../../Stores/Core';
import { useObserver } from 'mobx-react-lite';
import { FilterType } from '../../Models/Learn/FilterType.model'; 
import {  FilterTag, getDisplayFilterTags } from './MicrosoftLearnFilterUtils';
import { DefaultButton, styled } from '@fluentui/react';
import { IStylesOnly, IThemeOnlyProps, SimpleComponentStyles } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { themedClassNames } from '../../Core/Utils/FluentUI';

type FilterTagStyles = SimpleComponentStyles<'root' | 'tags'>;

const FilterTagsInner = ({ styles }: IStylesOnly<FilterTagStyles>):JSX.Element | null => {

    const learnStore = useStore('microsoftLearnStore');
    const productsMap = learnStore.productMap;
    const filter = learnStore.filter;
    const classes = themedClassNames(styles);

    return useObserver(()=>{
        let tagMap: FilterTag[] = getDisplayFilterTags(filter.displayFilters, filter.selectedFilters, productsMap, learnStore.catalog);
        return (
            <div className={classes.root}>          
                {tagMap.map(tag => (
                    <DefaultButton 
                        className={classes.tags}
                        iconProps={{iconName:"StatusCircleErrorX"}} 
                        text={tag.name} 
                        onClick={()=>{
                            if(tag.type===FilterType.Product){
                                let subItems: string[] = [...learnStore.catalog?.products.values()]
                                .filter(product => product.parentId && product.parentId===tag.id)
                                .map(product => product.id);                            
                                learnStore.removeFilter(tag.type, [...subItems, tag.id]);
                            }
                            else{
                                learnStore.removeFilter(tag.type, [tag.id]);
                            }                    
                        }} 
                    />
                ))}
            </div>  
        )
    })
}

const FilterTagStyles = ({ theme }: IThemeOnlyProps): FilterTagStyles => ({
    root: [
        {
            margin: `calc(${theme.spacing.s1}*1.5)`
        }
    ],
    tags: [
        {
            display: 'inline',
            backgroundColor: '#F3F2F1',
            borderRadius: '2px',
            marginRight: '4px',
            marginBottom: '4px',
            border: `0px`,
            padding: `0px 8px`,
            selectors: {
                '.ms-Button-flexContainer':{
                    flexDirection: 'row-reverse'
                },
                '.ms-Icon':{
                    fontWeight: 900
                }
            }
        }
    ]
})

export const MicrosoftLearnFilterTags = styled(FilterTagsInner, FilterTagStyles) 