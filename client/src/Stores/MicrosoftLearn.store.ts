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
import { AssignmentLearnContent } from '../Models/Learn/AssignmentLearnContent';
import { AssignmentLearnContentDto } from '../Dtos/Learn/AssignmentLearnContent.dto';
import { MicrosoftLearnFilterStore } from './MicrosoftLearnFilter.store';
import { debounceTime, map, filter, tap, switchMap } from 'rxjs/operators';
import { getRegexs, applySelectedFilter, setDisplayFilters, getUpdatedURI } from '../Features/MicrosoftLearn/MicrosoftLearnFilterCore';
import { FilterType } from '../Models/Learn/FilterType.model';
import { act } from 'react-dom/test-utils';

export class MicrosoftLearnStore extends ChildStore {
  @observable isLoadingCatalog: boolean | null = null;
  @observable catalog: Catalog | null = null;
  @observable selectedItems: AssignmentLearnContent[] | null = null;
  @observable filteredCatalogContent: LearnContent[] | null = null;

  microsoftLearnFilterStore = new MicrosoftLearnFilterStore();

  initialize(): void {
    toObservable(() => this.microsoftLearnFilterStore.searchTerm)
      .pipe(
        debounceTime(250),
        tap(() => (this.filteredCatalogContent = [])),
        map(searchTerm => getRegexs(searchTerm)),
        filter(() => !!this.catalog)
      )
     .subscribe(expressions => this.filteredCatalogContent = applySelectedFilter(this.catalog, this.microsoftLearnFilterStore.selectedFilters, 
          this.microsoftLearnFilterStore.searchTerm, expressions))
      
    let x = toObservable(() => this.filteredCatalogContent);
      x.subscribe(filteredCatalogContent => {this.microsoftLearnFilterStore.displayFilters = setDisplayFilters(this.catalog, filteredCatalogContent);
                              console.log('calling update display filter subscriber.')
        })

      x.subscribe(() => this.microsoftLearnFilterStore.learnFilterUriParam =  getUpdatedURI(this.microsoftLearnFilterStore.selectedFilters, this.microsoftLearnFilterStore.searchTerm,
        this.microsoftLearnFilterStore.expandedProducts, this.microsoftLearnFilterStore.productMap))

    toObservable(() => this.root.assignmentStore.assignment)
      .pipe(
        filter(assignment => !!assignment),
        map(assignment => assignment!.id),
        switchMap(assignmentId => MicrosoftLearnService.getAssignmentLearnContent(assignmentId)),
        filter(assignmentLearnContent => !assignmentLearnContent.error),
        map(assignmentLearnContent => assignmentLearnContent as AssignmentLearnContentDto[])
      )
      .subscribe(selectedItems => (this.selectedItems = selectedItems));         
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
      MicrosoftLearnService.saveAssignmentLearnContent(assignmentId, learnContentUid);
    }
  }

  @action
  clearAssignmentLearnContent(): void {
    this.selectedItems = [];
    const assignmentId = this.root.assignmentStore.assignment!.id;
    MicrosoftLearnService.clearAssignmentLearnContent(assignmentId);
  }

  @action
  async initializeCatalog(): Promise<void> {
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
    this.filteredCatalogContent = [...this.catalog.contents.values()];

    this.microsoftLearnFilterStore.initializeFilters(this.catalog);
    this.filteredCatalogContent = applySelectedFilter(this.catalog, this.microsoftLearnFilterStore.selectedFilters, this.microsoftLearnFilterStore.searchTerm);
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
    MicrosoftLearnService.removeAssignmentLearnContent(assignmentId, learnContentUid);
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
  }

  @action
  addFilter(type: FilterType, filters: string[]){
    this.microsoftLearnFilterStore.addFilter(type, filters);
    this.filteredCatalogContent = applySelectedFilter(this.catalog, this.microsoftLearnFilterStore.selectedFilters, 
                                                              this.microsoftLearnFilterStore.searchTerm);
  }

  @action
  removeFilter(type: FilterType, filters: string[]){
    this.microsoftLearnFilterStore.removeFilter(type, filters); 
    this.filteredCatalogContent = applySelectedFilter(this.catalog, this.microsoftLearnFilterStore.selectedFilters, 
                          this.microsoftLearnFilterStore.searchTerm);

  }
  
  @action
  resetFilters(){
    this.microsoftLearnFilterStore.resetFilter();
    this.filteredCatalogContent = applySelectedFilter(this.catalog, this.microsoftLearnFilterStore.selectedFilters, 
      this.microsoftLearnFilterStore.searchTerm);
  }
}