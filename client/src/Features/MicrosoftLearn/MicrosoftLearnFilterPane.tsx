/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import React, { useEffect, useReducer, useState } from 'react';
import {
  ActionButton,
  DefaultButton,
  Icon,
  Panel,
  PanelType,
  PrimaryButton,
  Separator,
  styled,
  Text
} from '@fluentui/react';
import { useStore } from '../../Stores/Core';
import { useObserver } from 'mobx-react-lite';
import { FilterComponent } from './MicrosoftLearnFilterComponentUtils';
import { IStylesOnly } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { themedClassNames } from '../../Core/Utils/FluentUI';
import { FilterType } from '../../Models/Learn/FilterType.model';
import { FilterPaneStyles } from './MicrosoftLearnFilterPaneStyles';
import { debounce } from 'lodash';

const FilterPaneLargeInner = ({ styles }: IStylesOnly<FilterPaneStyles>): JSX.Element | null => {
  const { filterStore } = useStore('microsoftLearnStore');
  const classes = themedClassNames(styles);

  const noFiltersExist = () => {
    let selectedFilters = filterStore.selectedFilter;
    return (
      selectedFilters[FilterType.products].length === 0 &&
      selectedFilters[FilterType.roles].length === 0 &&
      selectedFilters[FilterType.types].length === 0 &&
      selectedFilters[FilterType.levels].length === 0
    );
  };

  return useObserver(() => {
    return (
      <div>
        <ActionButton
          onClick={() => filterStore.resetFilter()}
          style={{ display: noFiltersExist() ? 'none' : 'block' }}
          className={classes.clearAll}
          text="Clear all filters"
        />
        <FilterComponent type={FilterType.products} name="Products" />
        <Separator />
        <FilterComponent type={FilterType.roles} name="Roles" />
        <Separator />
        <FilterComponent type={FilterType.levels} name="Levels" />
        <Separator />
        <FilterComponent type={FilterType.types} name="Types" />
      </div>
    );
  });
};

const FilterPaneSmallInner = ({ styles }: IStylesOnly<FilterPaneStyles>): JSX.Element | null => {
  const learnStore = useStore('microsoftLearnStore');
  type PanelContentOptions = FilterType | 'main' | 'none';
  type PanelContentStateType = { panelContent: PanelContentOptions; title?: string };
  const initialPanelContentState: PanelContentStateType = { panelContent: 'none' };

  const panelContentReducer = (
    state: PanelContentStateType,
    action: { type: PanelContentOptions }
  ): PanelContentStateType => {
    switch (action.type) {
      case 'none':
        return { panelContent: 'none' };
      case 'main':
        return { panelContent: 'main', title: 'Search Filters' };
      case FilterType.products:
        return { panelContent: FilterType.products, title: 'Products' };
      case FilterType.roles:
        return { panelContent: FilterType.roles, title: 'Roles' };
      case FilterType.levels:
        return { panelContent: FilterType.levels, title: 'Levels' };
      case FilterType.types:
        return { panelContent: FilterType.types, title: 'Types' };
      default:
        return { panelContent: 'none' };
    }
  };

  const [panelContentState, dispatchPanelContent] = useReducer(panelContentReducer, initialPanelContentState);
  const classes = themedClassNames(styles);

  const kFormatter = (num: number | bigint | any) => {
    return num > 999 ? (num / 1000).toFixed(1) + 'K' : num;
  };

  const backToMainFilters = (props: any, defaultRender: any) => {
    if (panelContentState.panelContent === 'main') {
      return <>{defaultRender!(props)}</>;
    }
    return (
      <div className={classes.filterPanelHeader}>
        <ActionButton onClick={() => dispatchPanelContent({ type: 'main' })}>
          <Icon iconName="Back" />
          <Text className="backTitle">All Filters</Text>
        </ActionButton>
        {defaultRender!(props)}
      </div>
    );
  };

  const PanelFooterContent = (num: number | undefined) => {
    return (
      <div className={classes.filterPanelFooter}>
        <PrimaryButton
          text={num ? `View results (${kFormatter(num)})` : `View results`}
          onClick={() => dispatchPanelContent({ type: 'none' })}
        />
        <DefaultButton text="Clear All" onClick={() => learnStore.filterStore.resetFilter()} />
      </div>
    );
  };

  const getPanelContent = () => {
    const capitalizeFirstLetter = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    switch (panelContentState.panelContent) {
      case 'main':
        return (
          <>
            {[FilterType.products, FilterType.roles, FilterType.levels, FilterType.types].map(filterType => (
              <ActionButton
                onClick={() => dispatchPanelContent({ type: filterType })}
                className={classes.mainPanelActionButtons}
              >
                <Text className="buttonTitle">{capitalizeFirstLetter(filterType)}</Text>
                <Icon iconName="ChevronRight" />
              </ActionButton>
            ))}
          </>
        );
      case FilterType.products:
        return <FilterComponent type={FilterType.products} name="Products" />;
      case FilterType.roles:
        return <FilterComponent type={FilterType.roles} name="Roles" />;
      case FilterType.levels:
        return <FilterComponent type={FilterType.levels} name="Levels" />;
      case FilterType.types:
        return <FilterComponent type={FilterType.types} name="Types" />;
      default:
        return null;
    }
  };

  return useObserver(() => {
    return (
      <>
        <DefaultButton
          iconProps={{ iconName: 'FilterSettings' }}
          className={classes.collapsePanelButton}
          text="Search Filters"
          onClick={() => dispatchPanelContent({ type: 'main' })}
          disabled={learnStore.isLoadingCatalog ? true : false}
        />
        <Panel
          headerText={panelContentState.title || ''}
          isOpen={panelContentState.panelContent !== 'none'}
          onDismiss={() => dispatchPanelContent({ type: 'none' })}
          closeButtonAriaLabel="Close"
          isFooterAtBottom={true}
          className={classes.filterPanelTabView}
          onRenderNavigationContent={backToMainFilters}
          type={PanelType.smallFixedNear}
        >
          <>{getPanelContent()}</>
          {PanelFooterContent(learnStore.filteredCatalogContent?.length)}
        </Panel>
      </>
    );
  });
};

// custom window resize hook
const useWindowWidth = () => {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const debouncedHandleResize = debounce(function handleResize() {
      setWidth(window.innerWidth);
    }, 200);
    window.addEventListener('resize', debouncedHandleResize);
    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
    };
  });
  return width;
};

const FilterPaneLarge = ({ styles }: IStylesOnly<FilterPaneStyles>): JSX.Element | null => {
  const classes = themedClassNames(styles);
  useWindowWidth();

  return useObserver(() => {
    return (
      <div className={classes.rootLarge}>
        <Text className={classes.title}>Filters</Text>
        <FilterPaneLargeInner styles={styles} />
      </div>
    );
  });
};

const FilterPaneSmall = ({ styles }: IStylesOnly<FilterPaneStyles>): JSX.Element | null => {
  const classes = themedClassNames(styles);
  useWindowWidth();

  return useObserver(() => {
    return (
      <div className={classes.rootSmall}>
        <FilterPaneSmallInner styles={styles} />
      </div>
    );
  });
};

export const MicrosoftLearnFilterPaneLarge = styled(FilterPaneLarge, FilterPaneStyles);
export const MicrosoftLearnFilterPaneSmall = styled(FilterPaneSmall, FilterPaneStyles);
