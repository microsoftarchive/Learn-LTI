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
import { debounceTime, map, filter, switchMap, tap} from 'rxjs/operators';
import { applySelectedFilter, getFiltersToDisplay } from '../Features/MicrosoftLearn/MicrosoftLearnFilterCore';
import { ServiceError } from '../Core/Utils/Axios/ServiceError';
import { WithError } from '../Core/Utils/Axios/safeData';
import _ from 'lodash';


enum LearnContentState{
  selected = 'selected',
  notSelected = 'not-selected'
}

type ContentSelectionProps = {
  userState: LearnContentState;
  syncedState: LearnContentState;
  callsInProgress: boolean;
}

export class MicrosoftLearnStore extends ChildStore {
  @observable isLoadingCatalog: boolean | null = null;
  @observable catalog: Catalog | null = null;
  @observable filteredCatalogContent: LearnContent[] | null = null;
  @observable contentSelectionMap: ObservableMap<string, ContentSelectionProps> = observable.map();    
  @observable clearCallInProgress: boolean = false;
  @observable clearCallsToMake: boolean = false;
  @observable hasServiceError: ServiceError | null = null;

  @computed get serviceCallsInProgress() {
    return _.sumBy([...this.contentSelectionMap.values()].map(item => item.callsInProgress === true))!==0
  }

  @computed get unSyncedItems() {
    return [...this.contentSelectionMap].filter(item => this.clearCallInProgress===false && this.clearCallsToMake===false && this.filterUnsynced(item));
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
            userState: LearnContentState.selected,
            syncedState: LearnContentState.selected,
            callsInProgress: false
          })
        );
      });

    toObservable(() => this.root.assignmentStore.assignment?.publishStatus).subscribe(publishStatus => {
      if (publishStatus === 'Published') {
        [...this.contentSelectionMap]
          .filter(items => items[1].syncedState !== items[1].userState)
          .forEach(items => this.contentSelectionMap.set(items[0], { ...items[1], userState: items[1].syncedState}));
      }
    });    

    toObservable(() => this.unSyncedItems)
      .pipe(
        debounceTime(500),
        filter(unSyncedContentItems => unSyncedContentItems.length>0),        
        tap(unSyncedContentItems => unSyncedContentItems.forEach(([contentUid, contentProps]) => this.contentSelectionMap.set(contentUid, {...contentProps, callsInProgress: true}))),
        map(unSyncedContentItems => unSyncedContentItems.map(item => this.makeServiceCall(item, this.root.assignmentStore.assignment?.id!!)))
      ).subscribe(responses => {
        console.log("inside contentid change subscribe")
          responses.forEach((serviceCallPromise) => {
            this.handleResponse(serviceCallPromise, this.root.assignmentStore.assignment?.id!!);
          })
      })

      toObservable(() => this.clearCallsToMake===true && this.clearCallInProgress==false && this.serviceCallsInProgress ===false )
      .subscribe(async (makeClearCall) => {
        if(makeClearCall){
          this.clearCallInProgress=true;
          this.clearCallsToMake=false;
          console.log("calling clear subscribe!");

          const assignmentId = this.root.assignmentStore.assignment!.id;
          const itemsToClear = [...this.contentSelectionMap].filter(item => item[1].syncedState===LearnContentState.selected && item[1].userState==='not-selected');      
          let r = MicrosoftLearnService.clearAssignmentLearnContent(assignmentId)
          this.handelClearCallResponse(r, itemsToClear);
        }
      })
  }

  filterUnsynced = ([contentUid, contentProps]: [string, ContentSelectionProps]) => contentProps.syncedState!==contentProps.userState && !contentProps.callsInProgress;

  async handelClearCallResponse (promise: Promise<ServiceError|null>, itemsToClear: [string, ContentSelectionProps][]){
    let serviceError = await promise;
    this.clearCallInProgress=false;
    if(serviceError===null){
      console.log("handling clear call")
      itemsToClear.forEach(item => {
        let previousState  = this.contentSelectionMap.get(item[0])!!;
        this.contentSelectionMap.set(item[0], {...previousState, syncedState: LearnContentState.notSelected});
      })
    } else {
      this.hasServiceError = serviceError;
    }

  }

  async makeServiceCall ([contentUid, contentProps]: [string, ContentSelectionProps], assignmentId: string){
    switch(contentProps.userState){
      case LearnContentState.selected: return {contentUid, contentProps, error: await MicrosoftLearnService.saveAssignmentLearnContent(assignmentId, contentUid)}
      case LearnContentState.notSelected: return {contentUid, contentProps, error: await MicrosoftLearnService.removeAssignmentLearnContent(assignmentId, contentUid)}
    }
  }

  async handleResponse (promise: Promise<{contentUid: string, contentProps: ContentSelectionProps, error: ServiceError | null}>, assignmentId: string){
    console.log("inside response")
    let resp = await promise
    if(resp.error!==null){
      this.hasServiceError =resp.error;
      this.contentSelectionMap.set(resp.contentUid, {...this.contentSelectionMap.get(resp.contentUid)!!, callsInProgress: false});
    } else {
      let currentContentState = this.contentSelectionMap.get(resp.contentUid)!!;
      this.contentSelectionMap.set(resp.contentUid, {...currentContentState, syncedState: resp.contentProps.userState});

      if (currentContentState.userState!==resp.contentProps.userState){
        let x = this.makeServiceCall([resp.contentUid, this.contentSelectionMap.get(resp.contentUid)!!], assignmentId)
        this.handleResponse(x, assignmentId);
      } else{
        this.contentSelectionMap.set(resp.contentUid, {...this.contentSelectionMap.get(resp.contentUid)!!, callsInProgress: false});
      }
    }
  }

  @action
  removeItemSelection(learnContentUid: string): void {
    this.toggleItemSelection(learnContentUid);
  }

  @action
  toggleItemSelection(learnContentUid: string): void {
    const assignmentId = this.root.assignmentStore.assignment!.id;
    let previousState = this.contentSelectionMap.get(learnContentUid);

    if (previousState && previousState.userState === LearnContentState.selected) {
      this.contentSelectionMap.set(learnContentUid, {...previousState, userState: LearnContentState.notSelected});
    } else if(previousState) {
      this.contentSelectionMap.set(learnContentUid, {...previousState, userState: LearnContentState.selected});
    } else {
      this.contentSelectionMap.set(learnContentUid, {userState: LearnContentState.selected, syncedState: LearnContentState.notSelected, callsInProgress: false});
    }
  }

  @action
  clearAssignmentLearnContent(): void {
    debounceTime(500);
    this.clearCallsToMake=true;
    const itemsToClear = [...this.contentSelectionMap].filter(item => item[1].userState===LearnContentState.selected);
    itemsToClear.forEach(item =>       
      this.contentSelectionMap.set(item[0], {
      ...item[1],
      userState: LearnContentState.notSelected
    }))
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
