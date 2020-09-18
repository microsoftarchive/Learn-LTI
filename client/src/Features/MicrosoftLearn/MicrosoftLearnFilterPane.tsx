import React, { useEffect, useState } from 'react';
import { ActionButton, DefaultButton, Icon, Panel, PanelType, PrimaryButton, styled, Text } from '@fluentui/react';
import { useStore } from '../../Stores/Core';
import { useObserver } from 'mobx-react-lite';
import { ProductFilterComponent, RoleFilterComponent, TypeFilterComponent, LevelFilterComponent } from './MicrosoftLearnFilterComponentUtils';
import { debounce } from 'lodash';
import { IStylesOnly } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { themedClassNames } from '../../Core/Utils/FluentUI';
import { FilterType } from '../../Models/Learn/FilterType.model';
import { FilterPaneStyles } from './MicrosoftLearnFilterPaneStyles';

const FilterPaneInner = ({ styles }: IStylesOnly<FilterPaneStyles>):JSX.Element | null  =>   {

    const learnStore = useStore('microsoftLearnStore');
    const isLoadingCatalog = !!learnStore.isLoadingCatalog;
    const catalogContent = learnStore.filteredCatalogContent;
    const noVisibleFilter = !isLoadingCatalog && catalogContent?.length === 0;


    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const debouncedHandleResize = debounce(function handleResize() {
            setWidth(window.innerWidth)
        }, 500)
        window.addEventListener('resize', debouncedHandleResize)
        return () => {
            window.removeEventListener('resize', debouncedHandleResize)        
        }
    })

    const [mainIsOpen, setMainOpen] = useState(false);
    const [productIsOpen, setProductOpen] = useState(false);
    const [roleIsOpen, setRoleOpen] = useState(false);
    const [typeIsOpen, setTypeOpen] = useState(false);
    const [levelIsOpen, setLevelOpen] = useState(false);
    const [panelIsOpen, setPanelOpen] = useState(false);

    const classes = themedClassNames(styles);


    const noFiltersExist = () => {
        let selectedFilters = learnStore.filter.selectedFilters;
        return selectedFilters.get(FilterType.Product)?.length===0 && selectedFilters.get(FilterType.Role)?.length===0 &&
                selectedFilters.get(FilterType.Type)?.length===0 && selectedFilters.get(FilterType.Level)?.length===0
    }

    // const kFormatter = (num: number | bigint | any) => {
    //     return Math.abs(num) > 999 ? (Math.abs(num)/1000).toFixed(1) + 'K' : Math.sign(num)*Math.abs(num)
    // }
    
    // const [num, setNum] = useState(learnStore.filteredCatalogContent?.length);

    // useEffect(()=>{
    //     setNum(learnStore.filteredCatalogContent?.length);
    // }, [learnStore.filteredCatalogContent])

    const onRenderFooterContent =  () => {
        return(
            <div className={classes.filterPanelFooter}>
                <PrimaryButton
                text='View results'
                onClick={()=>{
                    setPanelOpen(false);
                    setMainOpen(false);
                    setProductOpen(false);
                    setRoleOpen(false);
                    setLevelOpen(false);
                    setTypeOpen(false);
                }}
                />
                <DefaultButton 
                text="Clear All"
                onClick = {()=>{
                    learnStore.resetFilter()
                }}
                />
            </div>
    )}

    return useObserver(() => {
        if(width>768){
            return(
                <div className={classes.root}>
                    <Text className={classes.title} >Filters</Text> 
                    {noVisibleFilter? 
                        <Text variant="medium">Oops No filters available</Text>
                        :
                        (<div>
                            <ActionButton
                                onClick={()=>{learnStore.resetFilter()}}
                                style={{display: noFiltersExist()? 'none' : 'block'}}
                                className={classes.clearAll}
                                text="Clear all filters"
                            />
                            <ProductFilterComponent/>
                            <RoleFilterComponent/>
                            <LevelFilterComponent />
                            <TypeFilterComponent />
                        </div>)
                    }
                </div>
            )
        }

        else{
            const backToMainFilters = (props: any, defaultRender: any)=>{
                if(mainIsOpen){
                    return(
                        <>
                        {defaultRender!(props)}
                        </>
                    )
                }
                    return (
                        <div className={classes.filterPanelHeader}>
                        <ActionButton
                            onClick = {(event)=>{
                                setRoleOpen(false);
                                setTypeOpen(false);
                                setLevelOpen(false);
                                setProductOpen(false)
                                setMainOpen(true);
                            }}
                        >
                        <Icon iconName="Back"/>
                        <Text className='backTitle'>All Filters</Text>
                        </ActionButton>
                        {defaultRender!(props)}
                        </div>
                    )
            }

            const getHeader = ()=>{
                if(mainIsOpen)
                    return "Search Filters"
                else if(productIsOpen)
                    return "Products"
                else if(roleIsOpen)
                    return "Roles"
                else if(typeIsOpen)
                    return "Types"
                else if(levelIsOpen)
                    return "Levels"
                return ""
            }

            return(
                <div>
                <DefaultButton 
                iconProps={{iconName:"FilterSettings"}} 
                className={classes.collapsePanelButton} 
                text="Search Filters" 
                onClick={()=>{setPanelOpen(true);
                            setMainOpen(true);}
                } 
                disabled={learnStore.isLoadingCatalog? true : false}
                />

                <Panel
                    headerText={getHeader()}
                    isOpen={panelIsOpen}
                    onDismiss={()=>(setPanelOpen(false))}
                    closeButtonAriaLabel="Close"
                    isFooterAtBottom={true}
                    onRenderFooterContent={onRenderFooterContent}
                    className={classes.filterPanelTabView}
                    onRenderNavigationContent={backToMainFilters}
                    type={PanelType.smallFixedNear}>

                    <>
                    {mainIsOpen?(
                    <>
                        <ActionButton                  
                            onClick = {()=>{
                                setMainOpen(false)
                                setRoleOpen(false);
                                setTypeOpen(false);
                                setLevelOpen(false);
                                setProductOpen(true)}}
                            className={classes.mainPanelActionButtons}>
                        <Text className='buttonTitle'>Products</Text>
                        <Icon iconName='ChevronRight'/>
                        </ActionButton>

                        <ActionButton                  
                            onClick = {()=>{
                                setMainOpen(false)
                                setRoleOpen(true);
                                setTypeOpen(false);
                                setLevelOpen(false);
                                setProductOpen(false)
                            }}
                            className={classes.mainPanelActionButtons}>
                        <Text className='buttonTitle'>Roles</Text>
                        <Icon iconName='ChevronRight'/>
                        </ActionButton>

                        <ActionButton                  
                            onClick = {()=>{
                                setMainOpen(false)
                                setRoleOpen(false);
                                setTypeOpen(false);
                                setLevelOpen(true);
                                setProductOpen(false)
                            }}
                            className={classes.mainPanelActionButtons}>
                        <Text className='buttonTitle'>Levels</Text>
                        <Icon iconName='ChevronRight'/>
                        </ActionButton>

                        <ActionButton                  
                            onClick = {()=>{
                                setMainOpen(false)
                                setRoleOpen(false);
                                setTypeOpen(true);
                                setLevelOpen(false);
                                setProductOpen(false)
                            }}
                            className={classes.mainPanelActionButtons}>
                        <Text className='buttonTitle'>Types</Text>
                        <Icon iconName='ChevronRight'/>
                        </ActionButton>   
                    </>
                    ): 
                    (productIsOpen?
                        (<ProductFilterComponent/>): 
                        (roleIsOpen?
                            (<RoleFilterComponent/>):
                            (levelIsOpen?
                                (<LevelFilterComponent/>):
                                    (<TypeFilterComponent/>)
                            )
                        )
                    )
                    }
                    </>
                </Panel>
            </div>
            )
        }
    })
}

export const MicrosoftLearnFilterPane = styled(FilterPaneInner, FilterPaneStyles);
