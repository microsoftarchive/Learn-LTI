/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { ChildStore } from './Core';
import { observable, action } from 'mobx';
import { Catalog, LearnContent, Product } from '../Models/Learn';
import { MicrosoftLearnService } from '../Services/MicrosoftLearn.service';
import { CatalogDto, ProductChildDto, ProductDto } from '../Dtos/Learn';
import { toMap } from '../Core/Utils/Typescript/ToMap';
import { toObservable } from '../Core/Utils/Mobx/toObservable';
import { AssignmentLearnContentDto } from '../Dtos/Learn/AssignmentLearnContent.dto';
import { MicrosoftLearnFilterStore } from './MicrosoftLearnFilter.store';
import { debounceTime, map, filter, switchMap } from 'rxjs/operators';
import { applySelectedFilter, getFiltersToDisplay } from '../Features/MicrosoftLearn/MicrosoftLearnFilterCore';
import { ServiceError } from '../Core/Utils/Axios/ServiceError';
import { WithError } from '../Core/Utils/Axios/safeData';

interface ContentSelectionProps {
  userState: 'selected' | 'not-selected';
  syncedState: 'selected' | 'not-selected';
  callsInProgress: number;
  error: ServiceError | null;
  lattestAwaitedCall: Promise<void> | null;
}
const MAX_RETRIES = 3;

export class MicrosoftLearnStore extends ChildStore {
  @observable isLoadingCatalog: boolean | null = null;
  @observable catalog: Catalog | null = null;
  @observable filteredCatalogContent: LearnContent[] | null = null;
  @observable hasServiceError: ServiceError | null = null;
  @observable lattestAwaitedCall: Promise<void> | null = null;
  @observable contentSelectionMap: Map<string, ContentSelectionProps> = new Map<string, ContentSelectionProps>();
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

    toObservable(() => this.root.assignmentStore.assignment)
      .pipe(
        filter(assignment => !!assignment),
        map(assignment => assignment!.id),
        switchMap(getLearnContent),
        filter(assignmentLearnContent => !assignmentLearnContent.error),
        map(assignmentLearnContent => assignmentLearnContent as AssignmentLearnContentDto[])
      )
      .subscribe(selectedItems => {
        selectedItems.forEach(item =>
          this.contentSelectionMap.set(item.contentUid, {
            userState: 'selected',
            syncedState: 'selected',
            error: null,
            callsInProgress: 0,
            lattestAwaitedCall: null
          })
        );
      });

    toObservable(() => this.root.assignmentStore.assignment?.publishStatus).subscribe(publishStatus => {
      if (publishStatus === 'Published') {
        [...this.contentSelectionMap]
          .filter(items => items[1].syncedState !== items[1].userState)
          .forEach(items => this.contentSelectionMap.set(items[0], { ...items[1], userState: items[1].syncedState, error: null }));
      }
    });
  }

  @action
  removeItemSelection(learnContentUid: string): void {
    const assignmentId = this.root.assignmentStore.assignment!.id;
    this.applyRemoveItemSelection(assignmentId, learnContentUid);
  }

  async makeServiceCall(assignmentId: string, learnContentUid: string, callToMake: 'add' | 'remove') {
    let ntries = 0;
    let success = false;

    const callService = () => {
      switch (callToMake) {
        case 'add':
          return MicrosoftLearnService.saveAssignmentLearnContent(assignmentId, learnContentUid);
        case 'remove':
          return MicrosoftLearnService.removeAssignmentLearnContent(assignmentId, learnContentUid);
      }
    };
    const syncData = (error: ServiceError | null) => {
      const learnContentState = this.contentSelectionMap.get(learnContentUid)!!;
      if (error === null) {
        success = true;
        this.contentSelectionMap.set(learnContentUid, {
          ...learnContentState,
          syncedState: callToMake === 'add' ? 'selected' : 'not-selected',
          callsInProgress: learnContentState.callsInProgress - 1
        });
      } else {
        this.contentSelectionMap.set(learnContentUid, { 
          ...learnContentState, 
          error: error, 
          callsInProgress: learnContentState.callsInProgress - 1
        });
        this.hasServiceError = error;
      }
    };

    do {
      ntries++;
      let serviceError = await callService();
      syncData(serviceError);
    } while (success === false && ntries < MAX_RETRIES);
  }

  @action
  toggleItemSelection(learnContentUid: string): void {
    const assignmentId = this.root.assignmentStore.assignment!.id;

    if (this.contentSelectionMap.get(learnContentUid)?.userState === 'selected') {
      this.applyRemoveItemSelection(assignmentId, learnContentUid);
    } else {
      const learnContentState = this.contentSelectionMap.get(learnContentUid)!!;
      learnContentState.userState = 'selected';
      this.contentSelectionMap.set(learnContentUid, { ...learnContentState });

      let newPromise =
        learnContentState.callsInProgress > 0 && learnContentState.lattestAwaitedCall
          ? learnContentState.lattestAwaitedCall.then(() => this.makeServiceCall(assignmentId, learnContentUid, 'add'))
          : this.makeServiceCall(assignmentId, learnContentUid, 'add');
      this.contentSelectionMap.set(learnContentUid, {
        ...learnContentState,
        callsInProgress: learnContentState.callsInProgress + 1,
        lattestAwaitedCall: newPromise
      });
      this.lattestAwaitedCall = newPromise;
    }
  }

  async makeClearCall(assignmentId:string, itemsToClear: [string, ContentSelectionProps][]){
    let ntries = 0;
    let success = false;

    const syncData = (hasError: ServiceError | null) => {
      if (hasError === null) {
        success = true;
        itemsToClear.forEach(item => {
          let updatedItem = this.contentSelectionMap.get(item[0])!!
          this.contentSelectionMap.set(item[0], {
            ...updatedItem,
            syncedState: 'not-selected',
            callsInProgress: updatedItem.callsInProgress - 1
          });
        });
      } else {
        this.hasServiceError = hasError;
        itemsToClear.forEach(item => {
          let updatedItem = this.contentSelectionMap.get(item[0])!!;
          this.contentSelectionMap.set(item[0], {
            ...updatedItem,
            error: hasError, 
            callsInProgress: updatedItem.callsInProgress-1
          })
        })
      }
    };

    do {
      ntries++;
      let serviceError = await MicrosoftLearnService.clearAssignmentLearnContent(assignmentId);      
      syncData(serviceError);
    } while (ntries < MAX_RETRIES && success === false);
  };  

  @action
  clearAssignmentLearnContent(): void {
    const assignmentId = this.root.assignmentStore.assignment!.id;
    const itemsToClear = [...this.contentSelectionMap].filter(item => item[1].userState==='selected');
    itemsToClear.forEach(item =>       
      this.contentSelectionMap.set(item[0], {
      ...item[1],
      callsInProgress: item[1].callsInProgress + 1,
    }))

    let promise = this.lattestAwaitedCall? this.lattestAwaitedCall.then(() => this.makeClearCall(assignmentId, itemsToClear)) : this.makeClearCall(assignmentId, itemsToClear); 

    this.lattestAwaitedCall = promise;

    [...this.contentSelectionMap].forEach(item =>
      this.contentSelectionMap.set(item[0], {
        ...this.contentSelectionMap.get(item[0])!!,
        userState: 'not-selected',
        lattestAwaitedCall: promise
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
    allItems
      .map(item => item.uid)
      .filter(item => ![...this.contentSelectionMap.keys()].includes(item))
      .forEach(item =>
        this.contentSelectionMap.set(item, {
          userState: 'not-selected',
          syncedState: 'not-selected',
          callsInProgress: 0,
          error: null,
          lattestAwaitedCall: null
        })
      );
  }

  private applyRemoveItemSelection = (assignmentId: string, learnContentUid: string): void => {
    const learnContentState = this.contentSelectionMap.get(learnContentUid)!!;
    learnContentState.userState = 'not-selected';
    this.contentSelectionMap.set(learnContentUid, { ...learnContentState });

    let newPromise =
      learnContentState.callsInProgress > 0 && learnContentState.lattestAwaitedCall
        ? learnContentState.lattestAwaitedCall.then(() => this.makeServiceCall(assignmentId, learnContentUid, 'remove'))
        : this.makeServiceCall(assignmentId, learnContentUid, 'remove');
    this.contentSelectionMap.set(learnContentUid, {
      ...learnContentState,
      callsInProgress: learnContentState.callsInProgress + 1,
      lattestAwaitedCall: newPromise
    });
    this.lattestAwaitedCall = newPromise;
  };

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
