/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import _ from 'lodash';
import { action, observable } from 'mobx';
import {
  getUpdatedURIFromSelectedFilters,
  loadExpandedProductsFromQueryParams,
  loadFiltersFromQueryParams
} from '../Features/MicrosoftLearn/MicrosoftLearnFilterCore';
import { Catalog, Product } from '../Models/Learn';
import { FilterType } from '../Models/Learn/FilterType.model';
import { ChildStore } from './Core';
import { Filter } from '../Models/Learn/Filter.model';
import * as H from 'history';

export class MicrosoftLearnFilterStore extends ChildStore {
  @observable displayFilter: Filter = new Filter({});
  @observable selectedFilter: Filter = new Filter({});
  @observable learnFilterUriParam = '';
  @observable expandedProducts: string[] = [];
  productMap: Map<string, Product> = new Map<string, Product>();

  // We use H.createBrowserHistory() over useHistory() in order to avoid page reloads on URI updation. 
  history: H.History = H.createBrowserHistory();

  @action
  public initializeFilters(catalog: Catalog, filterParams: URLSearchParams | undefined): void {
    this.productMap = catalog.products;
    //this.getProductHierarchicalMap(catalog);

    if (filterParams) {
      this.selectedFilter = loadFiltersFromQueryParams(filterParams, this.productMap);
      this.expandedProducts = loadExpandedProductsFromQueryParams(filterParams);
      this.learnFilterUriParam = getUpdatedURIFromSelectedFilters(this.selectedFilter, this.expandedProducts, this.productMap);        
    }
  }

  updateExpandedProducts = (expanded: boolean) => (productId: string): void => {
    expanded
      ? this.expandedProducts.push(productId)
      : (this.expandedProducts = this.expandedProducts.filter(expandedProductId => expandedProductId !== productId));
    this.updateHistory();
  };
  @action expandProducts = this.updateExpandedProducts(true);
  @action collapseProducts = this.updateExpandedProducts(false);

  updateSelectedFilters(key: FilterType, value: string[]): void {
    const selectedFilter = _.clone(this.selectedFilter);
    selectedFilter[key] = value;
    this.selectedFilter = selectedFilter;
    this.updateHistory();
  }

  @action
  updateSearchTerm(newTerm: string): void {
    this.updateSelectedFilters(FilterType.terms, newTerm.split(' '));
  }

  @action
  addFilter(type: FilterType, addedFilters: string[]): void {
    const filters = [...this.selectedFilter[type], ...addedFilters];
    this.updateSelectedFilters(type, filters);
  }

  @action
  removeFilter(type: FilterType, removedFilters: string[]): void {
    const filters = this.selectedFilter[type].filter(item => !removedFilters.includes(item));
    this.updateSelectedFilters(type, filters);
  }

  @action
  resetFilter(): void {
    this.selectedFilter = new Filter({});
    this.updateHistory();
  }

  private updateHistory(): void {
    this.learnFilterUriParam = getUpdatedURIFromSelectedFilters(
      this.selectedFilter,
      this.expandedProducts,
      this.productMap
    );

    // Use of H.createBrowserHistory() prevents us from directly updating filters in the URL itself,
    // and let the remaining workflow (via page reload, and the hook in MSLearnPage.tsx) take care of content and UI updation.
    // This can be handled of in future stories.
    this.history.push({
      pathname: this.history.location.pathname,
      search: this.learnFilterUriParam.length > 0 ? '?' + this.learnFilterUriParam : ''
    });
  }

  // private getProductHierarchicalMap = (catalog: Catalog) => {
  //   let productParentChildMap = new Map<Product, Product[]>();
  //   let productMap = catalog?.products;
  //   if(productMap!=null){
  //     [...productMap.values()].filter(item => item?.parentId==null)
  //       .forEach((k)=>{
  //         let children = [...productMap?.values()].filter(product => product.parentId!==null && product.parentId===k.id)
  //         productParentChildMap.set(k, children);
  //       });
  //   }
  //   return productParentChildMap
  // }
}
