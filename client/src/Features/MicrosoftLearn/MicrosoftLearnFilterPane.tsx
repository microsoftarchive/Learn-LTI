import React, { useState } from 'react';
// import { SimpleComponentStyles, IStylesOnly, IThemeOnlyProps } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { ActionButton, DefaultButton, Icon, Panel, PanelType, Text } from '@fluentui/react';
// import { themedClassNames } from '../../Core/Utils/FluentUI';
import { useStore } from '../../Stores/Core';
// import { FixedSizeList } from 'react-window';
// import AutoSizer from 'react-virtualized-auto-sizer';
import { useObserver } from 'mobx-react-lite';
// import { FIXED_ITEM_HEIGHT, FIXED_ITEM_WIDTH } from './MicrosoftLearnStyles';
import { MicrosoftLearnFilterTags } from './MicrosoftLearnFilterTags';
import { ProductFilterComponent, RoleFilterComponent, TypeFilterComponent, LevelFilterComponent } from './MicrosoftLearnFilterComponentUtils';

const FilterPaneInner = ()=>{

    const learnStore = useStore('microsoftLearnStore');
    const isLoadingCatalog = !!learnStore.isLoadingCatalog;
    const catalogContent = learnStore.filteredCatalogContent;
    const noVisibleFilter = !isLoadingCatalog && catalogContent?.length === 0;

    const width = window.innerWidth;
    
    const [mainIsOpen, setMainOpen] = useState(false);
    const [productIsOpen, setProductOpen] = useState(false);
    const [roleIsOpen, setRoleOpen] = useState(false);
    const [typeIsOpen, setTypeOpen] = useState(false);
    const [levelIsOpen, setLevelOpen] = useState(false);

    return useObserver(() => {
        if(width>768){
            console.log(" >768 rendering filter full")
        return(
            <div style={{
                width:`25%`
            }}>
                FILTERS {learnStore.filteredCatalogContent?.length}
                {noVisibleFilter? 
                <Text>Oops No filters available</Text>
                :
                (        
                <div>
                    <button 
                    onClick={()=>{
                        learnStore.resetFilter();
                    }}                    
                    >
                        Clear All Filters
                    </button>        
                    <MicrosoftLearnFilterTags />         
                    <ProductFilterComponent/>
                    <br />
                    <RoleFilterComponent/>
                    <br />
                    <LevelFilterComponent />
                    <br />
                    <TypeFilterComponent />
                </div>
                )}
            </div>
        )
        }

        else{
            const backToMainFilters = (props: any, defaultRender: any)=>{
                return (
                    <>
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
                    <Text>All Filters</Text>
                    </ActionButton>
                    {defaultRender!(props)}
                    </>
                )
            }
            return(
                <div>
                <DefaultButton text="Open panel" onClick={()=>(setMainOpen(true))} />
                <Panel
                    headerText="Search Filters"
                    isOpen={mainIsOpen}
                    onDismiss={()=>(setMainOpen(false))}
                    closeButtonAriaLabel="Close"
                    isFooterAtBottom={true}
                    type={PanelType.smallFixedNear}
                >

                <ActionButton                  
                    onClick = {()=>(setProductOpen(true))}                                        
                >
                <Text>Products</Text>
                <Icon iconName='ChevronRight'/>
                </ActionButton>
                <br/>
                <ActionButton                  
                    onClick = {()=>(setRoleOpen(true))}                    
                >
                <Text>Roles</Text>
                <Icon iconName='ChevronRight'/>
                </ActionButton>
                <br/>
                <ActionButton                  
                    onClick = {()=>(setLevelOpen(true))}                    
                >
                <Text>Levels</Text>
                <Icon iconName='ChevronRight'/>
                </ActionButton>
                <br/>
                <ActionButton                  
                    onClick = {()=>(setTypeOpen(true))}                    
                >
                <Text>Types</Text>
                <Icon iconName='ChevronRight'/>
                </ActionButton>
                </Panel>

                <Panel
                    headerText="Products"
                    isOpen={productIsOpen}
                    onDismiss={()=>(setProductOpen(false))}
                    closeButtonAriaLabel="Close"
                    isFooterAtBottom={true}
                    type={PanelType.smallFixedNear}     
                    onRenderNavigationContent={backToMainFilters} 
                >
                    <ProductFilterComponent/>
                </Panel>

                <Panel
                    headerText="Roles"
                    isOpen={roleIsOpen}
                    onDismiss={()=>(setRoleOpen(false))}
                    closeButtonAriaLabel="Close"
                    isFooterAtBottom={true}
                    type={PanelType.smallFixedNear}     
                    onRenderNavigationContent={backToMainFilters} 
                >
                    <RoleFilterComponent/>
                </Panel>

                <Panel
                    headerText="Levels"
                    isOpen={levelIsOpen}
                    onDismiss={()=>(setLevelOpen(false))}
                    closeButtonAriaLabel="Close"
                    isFooterAtBottom={true}
                    type={PanelType.smallFixedNear}     
                    onRenderNavigationContent={backToMainFilters} 
                >
                    <LevelFilterComponent/>
                </Panel>

                <Panel
                    headerText="Types"
                    isOpen={typeIsOpen}
                    onDismiss={()=>(setTypeOpen(false))}
                    closeButtonAriaLabel="Close"
                    isFooterAtBottom={true}
                    type={PanelType.smallFixedNear}     
                    onRenderNavigationContent={backToMainFilters} 
                >
                <TypeFilterComponent/>
                </Panel>
                </div>
               )
        }

    })
}

export const MicrosoftLearnFilterPane = FilterPaneInner;