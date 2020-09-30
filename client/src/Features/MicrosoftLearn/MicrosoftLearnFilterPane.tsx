import React, { useEffect, useState } from 'react';
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
import {
  ProductFilterComponent,
  RoleFilterComponent,
  TypeFilterComponent,
  LevelFilterComponent
} from './MicrosoftLearnFilterComponentUtils';
import { debounce } from 'lodash';
import { IStylesOnly } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { themedClassNames } from '../../Core/Utils/FluentUI';
import { FilterType } from '../../Models/Learn/FilterType.model';
import { FilterPaneStyles } from './MicrosoftLearnFilterPaneStyles';

const FilterPaneLarge = ({ styles }: IStylesOnly<FilterPaneStyles>): JSX.Element | null => {
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

  return (
    <div>
      <ActionButton
        onClick={() => filterStore.resetFilter()}
        style={{ display: noFiltersExist() ? 'none' : 'block' }}
        className={classes.clearAll}
        text="Clear all filters"
      />
      <ProductFilterComponent />
      <Separator />
      <RoleFilterComponent />
      <Separator />
      <LevelFilterComponent />
      <Separator />
      <TypeFilterComponent />
    </div>
  );
};

const FilterPaneSmall = ({ styles }: IStylesOnly<FilterPaneStyles>): JSX.Element | null => {
  const { filterStore, filteredCatalogContent, isLoadingCatalog } = useStore('microsoftLearnStore');

  const [mainIsOpen, setMainOpen] = useState(false);
  const [productIsOpen, setProductOpen] = useState(false);
  const [roleIsOpen, setRoleOpen] = useState(false);
  const [typeIsOpen, setTypeOpen] = useState(false);
  const [levelIsOpen, setLevelOpen] = useState(false);
  const [panelIsOpen, setPanelOpen] = useState(false);

  const classes = themedClassNames(styles);

  const setOpen = (main: boolean, products: boolean, roles: boolean, types: boolean, levels: boolean) => {
    setMainOpen(main);
    setProductOpen(products);
    setRoleOpen(roles);
    setLevelOpen(levels);
    setTypeOpen(types);
  };

  const backToMainFilters = (props: any, defaultRender: any) => {
    if (mainIsOpen) {
      return <>{defaultRender!(props)}</>;
    }
    return (
      <div className={classes.filterPanelHeader}>
        <ActionButton onClick={event => setOpen(true, false, false, false, false)}>
          <Icon iconName="Back" />
          <Text className="backTitle">All Filters</Text>
        </ActionButton>
        {defaultRender!(props)}
      </div>
    );
  };

  const getHeader = () => {
    if (mainIsOpen) return 'Search Filters';
    else if (productIsOpen) return 'Products';
    else if (roleIsOpen) return 'Roles';
    else if (typeIsOpen) return 'Types';
    else if (levelIsOpen) return 'Levels';
    return '';
  };

  const kFormatter = (num: number | bigint | any) => {
    return Math.abs(num) > 999 ? (Math.abs(num) / 1000).toFixed(1) + 'K' : Math.sign(num) * Math.abs(num);
  };

  const PanelFooterContent = (num: number | undefined) => {
    return (
      <div className={classes.filterPanelFooter}>
        <PrimaryButton
          text={num ? `View results (${kFormatter(num)})` : `View results`}
          onClick={() => {
            setPanelOpen(false);
          }}
        />
        <DefaultButton
          text="Clear All"
          onClick={() => {
            filterStore.resetFilter();
          }}
        />
      </div>
    );
  };

  return (
    <>
      <DefaultButton
        iconProps={{ iconName: 'FilterSettings' }}
        className={classes.collapsePanelButton}
        text="Search Filters"
        onClick={() => {
          setPanelOpen(true);
          setMainOpen(true);
        }}
        disabled={isLoadingCatalog ? true : false}
      />

      <Panel
        headerText={getHeader()}
        isOpen={panelIsOpen}
        onDismiss={() => setPanelOpen(false)}
        closeButtonAriaLabel="Close"
        isFooterAtBottom={true}
        className={classes.filterPanelTabView}
        onRenderNavigationContent={backToMainFilters}
        type={PanelType.smallFixedNear}
      >
        <>
          {mainIsOpen ? (
            <>
              <ActionButton
                onClick={() => setOpen(false, true, false, false, false)}
                className={classes.mainPanelActionButtons}
              >
                <Text className="buttonTitle">Products</Text>
                <Icon iconName="ChevronRight" />
              </ActionButton>

              <ActionButton
                onClick={() => setOpen(false, false, true, false, false)}
                className={classes.mainPanelActionButtons}
              >
                <Text className="buttonTitle">Roles</Text>
                <Icon iconName="ChevronRight" />
              </ActionButton>

              <ActionButton
                onClick={() => setOpen(false, false, false, false, true)}
                className={classes.mainPanelActionButtons}
              >
                <Text className="buttonTitle">Levels</Text>
                <Icon iconName="ChevronRight" />
              </ActionButton>

              <ActionButton
                onClick={() => setOpen(false, false, false, true, false)}
                className={classes.mainPanelActionButtons}
              >
                <Text className="buttonTitle">Types</Text>
                <Icon iconName="ChevronRight" />
              </ActionButton>
            </>
          ) : productIsOpen ? (
            <ProductFilterComponent />
          ) : roleIsOpen ? (
            <RoleFilterComponent />
          ) : levelIsOpen ? (
            <LevelFilterComponent />
          ) : (
            <TypeFilterComponent />
          )}
        </>
        {PanelFooterContent(filteredCatalogContent?.length)}
      </Panel>
    </>
  );
};

const FilterPaneInner = ({ styles }: IStylesOnly<FilterPaneStyles>): JSX.Element | null => {
  const learnStore = useStore('microsoftLearnStore');
  const [width, setWidth] = useState(window.innerWidth);
  const classes = themedClassNames(styles);

  useEffect(() => {
    const debouncedHandleResize = debounce(function handleResize() {
      setWidth(window.innerWidth);
    }, 500);
    window.addEventListener('resize', debouncedHandleResize);
    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
    };
  });

  return useObserver(() => {
    return width > 768 ? (
      <div className={classes.root}>
        <Text className={classes.title}>Filters</Text>
        {!learnStore.isLoadingCatalog && learnStore.filteredCatalogContent?.length === 0 ? (
          <></>
        ) : (
          <div>
            <FilterPaneLarge styles={styles} />
          </div>
        )}
      </div>
    ) : (
      <div>
        {!learnStore.isLoadingCatalog && learnStore.filteredCatalogContent?.length === 0 ? (
          <></>
        ) : (
          <FilterPaneSmall styles={styles} />
        )}
      </div>
    );
  });
};

export const MicrosoftLearnFilterPane = styled(FilterPaneInner, FilterPaneStyles);
