/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { ChildStore } from './Core';
import { observable, action, ObservableMap, computed } from 'mobx';
import { Catalog, LearnContent, Product } from '../Models/Learn';
import { MicrosoftLearnService } from '../Services/MicrosoftLearn.service';
import { CatalogDto, ProductChildDto, ProductDto } from '../Dtos/Learn';
import { toMap } from '../Core/Utils/Typescript/ToMap';
import { toObservable } from '../Core/Utils/Mobx/toObservable';
import { AssignmentLearnContentDto } from '../Dtos/Learn/AssignmentLearnContent.dto';
import { MicrosoftLearnFilterStore } from './MicrosoftLearnFilter.store';
import { debounceTime, map, filter, switchMap, tap } from 'rxjs/operators';
import { applySelectedFilter, getFiltersToDisplay } from '../Features/MicrosoftLearn/MicrosoftLearnFilterCore';
import { ServiceError } from '../Core/Utils/Axios/ServiceError';
import { WithError } from '../Core/Utils/Axios/safeData';
import _ from 'lodash';

enum LearnContentState {
  selected = 'selected',
  notSelected = 'not-selected'
}

enum CallStatus {
  success = 'success',
  inProgress = 'in-progress',
  error = 'error'
}

type ContentSelectionProps = {
  userState: LearnContentState;
  syncedState: LearnContentState;
  callStatus: CallStatus;
}

export class MicrosoftLearnStore extends ChildStore {
  @observable isLoadingCatalog: boolean | null = null;
  @observable catalog: Catalog | null = null;
  @observable filteredCatalogContent: LearnContent[] | null = null;
  @observable contentSelectionMap: ObservableMap<string, ContentSelectionProps> = observable.map();
  @observable clearCallInProgress: boolean = false;
  @observable clearCallsToMake: boolean = false;
  @observable hasServiceError: ServiceError | null = null;

  @computed get serviceCallsInProgress(): boolean {
    return _.sumBy([...this.contentSelectionMap.values()].map(item => item.callStatus === CallStatus.inProgress)) !== 0;
  }

  @computed get unSyncedItems(): Array<[string, ContentSelectionProps]> {
    return [...this.contentSelectionMap].filter(
      item => this.clearCallInProgress === false && this.clearCallsToMake === false && this.isItemUnsynced(item)
    );
  }

  @computed get itemsInErrorState(): Array<[string, ContentSelectionProps]>{
    return [...this.contentSelectionMap].filter(([contentUid, contentProps]) => contentProps.callStatus===CallStatus.error);
  }

  filterStore = new MicrosoftLearnFilterStore();

  initialize(): void {
    const filteredContentObservable = toObservable(() => this.filterStore.selectedFilter).pipe(
      debounceTime(250),
      filter(() => !!this.catalog),
      map(filter => applySelectedFilter(this.catalog, filter))
    );

    filteredContentObservable.subscribe(filteredContent => {
      this.filteredCatalogContent = filteredContent;
    });

    filteredContentObservable
      .pipe(map(filteredContent => getFiltersToDisplay(this.catalog, filteredContent)))
      .subscribe(filtersToDisplay => {
        this.filterStore.displayFilter = filtersToDisplay;
      });

    const getLearnContent = async (assignmentId: string): Promise<WithError<AssignmentLearnContentDto[]>> => {
      const assignmentLearnContent = await MicrosoftLearnService.getAssignmentLearnContent(assignmentId);
      if (assignmentLearnContent.error) {
        this.hasServiceError = assignmentLearnContent.error;
      }
      return assignmentLearnContent;
    };

    toObservable(() => this.root.assignmentStore.assignment?.id)
      .pipe(
        filter(assignmentId => assignmentId !== undefined),
        map(assignmentId => assignmentId!!),
        switchMap(getLearnContent),
        filter(assignmentLearnContent => !assignmentLearnContent.error),
        map(assignmentLearnContent => assignmentLearnContent as AssignmentLearnContentDto[])
      )
      .subscribe(selectedItems => {
        selectedItems.forEach(item =>
          this.contentSelectionMap.set(item.contentUid, {
            userState: LearnContentState.selected,
            syncedState: LearnContentState.selected,
            callStatus: CallStatus.success
          })
        );
      });

    const updateUserState = () => {
      [...this.contentSelectionMap]
        .filter(([contentUid, contentProps]) => contentProps.syncedState !== contentProps.userState)
        .forEach(([contentUid, contentProps]) =>
          this.contentSelectionMap.set(contentUid, { ...contentProps, userState: contentProps.syncedState, callStatus: CallStatus.success })
        );
    };
    toObservable(() => this.root.assignmentStore.assignment?.publishStatus).subscribe(publishStatus => {
      if (publishStatus === 'Published' && this.serviceCallsInProgress === false) {
        updateUserState();
        this.hasServiceError = null;
      }
    });
    toObservable(() => this.serviceCallsInProgress).subscribe(serviceCallsInProgress => {
      if (
        serviceCallsInProgress === false &&
        this.root.assignmentStore.assignment?.publishStatus === 'Published'
      ) {
        updateUserState();
      }
    });

    toObservable(() => this.unSyncedItems)
      .pipe(
        debounceTime(500),
        filter(unSyncedItems => unSyncedItems.length > 0),
        tap(unSyncedItems =>
          unSyncedItems.forEach(([contentUid, contentProps]) =>
            this.contentSelectionMap.set(contentUid, { ...contentProps, callStatus: CallStatus.inProgress })
          )
        ),
        map(unSyncedItems =>
          unSyncedItems.map(item => this.makeToggleServiceCall(item, this.root.assignmentStore.assignment?.id!!))
        )
      )
      .subscribe(serviceCallPromises => {
        serviceCallPromises.forEach(promise => {
          this.handleToggleServiceCallResponse(promise, this.root.assignmentStore.assignment?.id!!);
        });
      });

    toObservable(
      () => this.clearCallsToMake === true && this.clearCallInProgress === false && this.serviceCallsInProgress === false
    ).subscribe(async makeClearCall => {
      if (makeClearCall) {
        this.clearCallInProgress = true;
        this.clearCallsToMake = false;
        const itemsToClear = [...this.contentSelectionMap].filter(
          ([contentUid, contentProps]) => 
          (contentProps.syncedState === LearnContentState.selected && contentProps.callStatus===CallStatus.success) ||
          (contentProps.syncedState === LearnContentState.notSelected && contentProps.callStatus===CallStatus.error));
        let promise = MicrosoftLearnService.clearAssignmentLearnContent(this.root.assignmentStore.assignment!.id);
        this.handelClearCallResponse(promise, itemsToClear);
      }
    });
  }

  isItemUnsynced = ([contentUid, contentProps]: [string, ContentSelectionProps]) =>
    contentProps.syncedState !== contentProps.userState &&
    contentProps.callStatus === CallStatus.success;

  async handelClearCallResponse(
    promise: Promise<ServiceError | null>,
    itemsToClear: [string, ContentSelectionProps][]
  ) {
    let serviceError = await promise;
    if (serviceError === null) {
      itemsToClear.forEach(([contentUid, contentProps]) => {
        let previousState = this.contentSelectionMap.get(contentUid)!!;
        this.contentSelectionMap.set(contentUid, { ...previousState, callStatus: CallStatus.success, syncedState: LearnContentState.notSelected });
      });
    } else {
      this.hasServiceError = serviceError;
      itemsToClear.forEach(([contentUid, contentProps]) => {
        let previousState = this.contentSelectionMap.get(contentUid)!!;
        this.contentSelectionMap.set(contentUid, { ...previousState, callStatus: CallStatus.error });
      });
    }
    this.clearCallInProgress = false;
  }

  async makeToggleServiceCall([contentUid, contentProps]: [string, ContentSelectionProps], assignmentId: string) {
    switch (contentProps.userState) {
      case LearnContentState.selected:
        return {
          contentUid,
          contentProps,
          error: await MicrosoftLearnService.saveAssignmentLearnContent(assignmentId, contentUid)
        };
      case LearnContentState.notSelected:
        return {
          contentUid,
          contentProps,
          error: await MicrosoftLearnService.removeAssignmentLearnContent(assignmentId, contentUid)
        };
    }
  }

  async handleToggleServiceCallResponse(
    promise: Promise<{ contentUid: string; contentProps: ContentSelectionProps; error: ServiceError | null }>,
    assignmentId: string
  ) {
    let response = await promise;
    if (response.error !== null) {
      this.hasServiceError = response.error;
      this.contentSelectionMap.set(response.contentUid, {
        ...this.contentSelectionMap.get(response.contentUid)!!,
        callStatus: CallStatus.error
      });
    } else {
      let currentContentState = this.contentSelectionMap.get(response.contentUid)!!;
      this.contentSelectionMap.set(response.contentUid, {
        ...currentContentState,
        syncedState: response.contentProps.userState
      });

      if (currentContentState.userState !== response.contentProps.userState && !this.clearCallsToMake) {
        let promise = this.makeToggleServiceCall(
          [response.contentUid, this.contentSelectionMap.get(response.contentUid)!!],
          assignmentId
        );
        this.handleToggleServiceCallResponse(promise, assignmentId);
      } else {
        this.contentSelectionMap.set(response.contentUid, {
          ...this.contentSelectionMap.get(response.contentUid)!!,
          callStatus: CallStatus.success
        });
      }
    }
  }

  @action
  toggleItemSelection(learnContentUid: string): void {
    let previousState = this.contentSelectionMap.get(learnContentUid);
    if (previousState && previousState.userState === LearnContentState.selected) {
      this.contentSelectionMap.set(learnContentUid, {
        ...previousState,
        callStatus: previousState?.callStatus === CallStatus.error ? CallStatus.success : previousState?.callStatus,
        userState: LearnContentState.notSelected
      });
    } else if (previousState) {
      this.contentSelectionMap.set(learnContentUid, {
        ...previousState,
        callStatus: previousState?.callStatus === CallStatus.error ? CallStatus.success : previousState?.callStatus,
        userState: LearnContentState.selected
      });
    } else {
      this.contentSelectionMap.set(learnContentUid, {
        userState: LearnContentState.selected,
        syncedState: LearnContentState.notSelected,
        callStatus: CallStatus.success
      });
    }
  }

  @action
  clearAssignmentLearnContent(): void {
    debounceTime(500);
    this.clearCallsToMake = true;
    const itemsToClear = [...this.contentSelectionMap].filter(item => item[1].userState === LearnContentState.selected);
    itemsToClear.forEach(item =>
      this.contentSelectionMap.set(item[0], {
        ...item[1],
        userState: LearnContentState.notSelected
      })
    );
  }

  @action
  async initializeCatalog(searchParams: string = ''): Promise<void> {
    this.isLoadingCatalog = true;
    const catalog = await MicrosoftLearnService.getCatalog();
    if (catalog.error) {
      // Will show the error on the message bar once it's implemented
      return;
    }

    const { modules, learningPaths } = catalog;
    const products = this.getProducts(catalog);
    const roles = toMap(catalog.roles, item => item.id);
    const levels = toMap(catalog.levels, item => item.id);
    const allItems = [...modules, ...learningPaths];
    const items = toMap(allItems, item => item.uid);
    this.catalog = { contents: items, products, roles, levels };
    this.isLoadingCatalog = false;
    this.filteredCatalogContent = allItems;
    this.filterStore.initializeFilters(this.catalog, searchParams);
  }

  private getProducts = (catalog: CatalogDto): Map<string, Product> => {
    const productsMap = new Map<string, Product>();
    const setItemInCatalog = (item: ProductChildDto | ProductDto, parent?: ProductDto): void => {
      productsMap.set(item.id, {
        id: item.id,
        parentId: parent?.id || null,
        name: item.name
      });
    };

    catalog.products.forEach(product => {
      setItemInCatalog(product);
      product.children?.forEach(productChild => setItemInCatalog(productChild, product));
    });

    return productsMap;
  };
}
