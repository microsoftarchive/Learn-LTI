/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { ChildStore } from './Core';
import { observable, action } from 'mobx';
import { Catalog, Product, LearnContent } from '../Models/Learn';
import { MicrosoftLearnService } from '../Services/MicrosoftLearn.service';
import { CatalogDto, ProductChildDto, ProductDto } from '../Dtos/Learn';
import { toMap } from '../Core/Utils/Typescript/ToMap';
import { debounceTime, map, filter, switchMap } from 'rxjs/operators';
import _ from 'lodash';
import { toObservable } from '../Core/Utils/Mobx/toObservable';
import { AssignmentLearnContent } from '../Models/Learn/AssignmentLearnContent';
import { AssignmentLearnContentDto } from '../Dtos/Learn/AssignmentLearnContent.dto';
import { ServiceError } from '../Core/Utils/Axios/ServiceError';
import { applySelectedFilter, getFiltersToDisplay } from '../Features/MicrosoftLearn/MicrosoftLearnFilterCore';
import { MicrosoftLearnFilterStore } from './MicrosoftLearnFilter.store';

export class MicrosoftLearnStore extends ChildStore {
  @observable isLoadingCatalog: boolean | null = null;
  @observable catalog: Catalog | null = null;
  @observable selectedItems: AssignmentLearnContent[] | null = null;
  @observable syncedSelectedItems: AssignmentLearnContent[] | null = null; 
  @observable filteredCatalogContent: LearnContent[] | null = null;
  @observable searchTerm = '';
  @observable serviceCallInProgress: number = 0;
  @observable isSynced: boolean | null = null;
  @observable hasServiceError: ServiceError | null = null;

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

    const assignmentLearnContentObservable = toObservable(() => this.root.assignmentStore.assignment)
      .pipe(
        filter(assignment => !!assignment),
        map(assignment => assignment!.id),
        switchMap(assignmentId => MicrosoftLearnService.getAssignmentLearnContent(assignmentId)),
      );

    assignmentLearnContentObservable
      .pipe(
        filter(assignmentLearnContent => !assignmentLearnContent.error),
        map(assignmentLearnContent => assignmentLearnContent as AssignmentLearnContentDto[])
      )
      .subscribe(selectedItems => {
        this.selectedItems = selectedItems; 
        this.syncedSelectedItems = selectedItems; 
        this.isSynced = true; 
      });

    assignmentLearnContentObservable
      .subscribe(assignmentLearnContent => {
        if(assignmentLearnContent.error!==undefined){
          this.hasServiceError=assignmentLearnContent.error
        }
      })
    
    toObservable(() => this.root.assignmentStore.assignment?.publishStatus)
      .subscribe(publishStatus => {
        if(publishStatus==='Published'){
          this.selectedItems = this.syncedSelectedItems; 
          this.isSynced = true;          
        }
      })
  }

  @action
  updateSearchTerm(searchTerm: string): void {
    this.searchTerm = searchTerm;
  }

  @action
  removeItemSelection(learnContentUid: string): void {
    const assignmentId = this.root.assignmentStore.assignment!.id;
    const itemIndexInSelectedItemsList = this.getItemIndexInSelectedList(learnContentUid);
    if (itemIndexInSelectedItemsList == null) {
      return;
    }
    this.applyRemoveItemSelection(itemIndexInSelectedItemsList, assignmentId, learnContentUid);
  }

  @action
  toggleItemSelection(learnContentUid: string): void {
    const assignmentId = this.root.assignmentStore.assignment!.id;
    const itemIndexInSelectedItemsList = this.getItemIndexInSelectedList(learnContentUid);
    if (itemIndexInSelectedItemsList == null) {
      return;
    }
    if (itemIndexInSelectedItemsList > -1) {
      this.applyRemoveItemSelection(itemIndexInSelectedItemsList, assignmentId, learnContentUid);
    } else {
      this.selectedItems?.push({ contentUid: learnContentUid });

      this.serviceCallInProgress++; 
      MicrosoftLearnService.saveAssignmentLearnContent(assignmentId, learnContentUid)
        .then(hasError => {
          if(hasError === null){
            this.syncedSelectedItems?.push({ contentUid: learnContentUid });
          } else {
            this.hasServiceError = hasError          
          }
          this.serviceCallInProgress--; 
          this.isSynced = _.differenceBy(this.selectedItems, this.syncedSelectedItems!!, 'contentUid').length === 0;
        })
    }
  }

  @action
  clearAssignmentLearnContent(): void {
    this.selectedItems = [];
    const assignmentId = this.root.assignmentStore.assignment!.id;

    this.serviceCallInProgress++; 
    MicrosoftLearnService.clearAssignmentLearnContent(assignmentId)
      .then(hasError => {
        if(hasError === null){
          this.syncedSelectedItems = [];
        } else{
          this.hasServiceError = hasError;        
        }
        this.serviceCallInProgress--; 
        this.isSynced = _.differenceBy(this.selectedItems, this.syncedSelectedItems!!, 'contentUid').length === 0;
      })  
  }

  @action
  async initializeCatalog(searchParams: string = ''): Promise<void> {
    this.isLoadingCatalog = true;
    const catalog = await MicrosoftLearnService.getCatalog();
    if (catalog.error) {
      // Will show the error on the message bar once it's implemented
      this.hasServiceError = catalog.error;
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

  private getItemIndexInSelectedList = (learnContentUid: string): number | void => {
    return this.selectedItems?.findIndex(item => item.contentUid === learnContentUid);
  };

  private applyRemoveItemSelection = (
    itemIndexInSelectedItemsList: number,
    assignmentId: string,
    learnContentUid: string
  ): void => {
    this.selectedItems?.splice(itemIndexInSelectedItemsList, 1);

    this.serviceCallInProgress++; 
    MicrosoftLearnService.removeAssignmentLearnContent(assignmentId, learnContentUid)
      .then(hasError => {
        if(hasError === null){
          this.syncedSelectedItems?.splice(itemIndexInSelectedItemsList, 1);
        } else{
          this.hasServiceError = hasError;        
        }
        this.serviceCallInProgress--; 
        this.isSynced = _.differenceBy(this.selectedItems, this.syncedSelectedItems!!, 'contentUid').length === 0;
      })
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