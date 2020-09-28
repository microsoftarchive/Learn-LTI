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

  @action
  public initializeFilters(catalog: Catalog, filterParams: URLSearchParams | undefined): void {
    this.productMap = catalog.products;
    //this.getProductHierarchicalMap(catalog);

    if (filterParams) {
      this.selectedFilter = loadFiltersFromQueryParams(filterParams, this.productMap);
      this.expandedProducts = loadExpandedProductsFromQueryParams(filterParams);
      this.learnFilterUriParam = getUpdatedURIfromSelectedFilters(this.selectedFilter, this.expandedProducts, this.productMap);        
    }
  }

  updateExpandedProducts = (expanded: boolean) => (productId: string, history: H.History): void => {
    expanded
      ? this.expandedProducts.push(productId)
      : (this.expandedProducts = this.expandedProducts.filter(expandedProductId => expandedProductId !== productId));
    this.updateHistory(history);
  };
  @action expandProducts = this.updateExpandedProducts(true);
  @action collapseProducts = this.updateExpandedProducts(false);

  updateSelectedFilters(key: FilterType, value: string[], history: H.History): void {
    const selectedFilter = _.clone(this.selectedFilter);
    selectedFilter[key] = value;
    this.selectedFilter = selectedFilter;
    this.updateHistory(history);
  }

  @action
  updateSearchTerm(newTerm: string, history: H.History): void {
    this.updateSelectedFilters(FilterType.terms, newTerm.split(' '), history);
  }

  @action
  addFilter(type: FilterType, addedFilters: string[], history: H.History): void {
    const filters = [...this.selectedFilter[type], ...addedFilters];
    this.updateSelectedFilters(type, filters, history);
  }

  @action
  removeFilter(type: FilterType, removedFilters: string[], history: H.History): void {
    const filters = this.selectedFilter[type].filter(item => !removedFilters.includes(item));
    this.updateSelectedFilters(type, filters, history);
  }

  @action
  resetFilter(history: H.History): void {
    this.selectedFilter = new Filter({});
    this.updateHistory(history);
  }
  private updateHistory(history: H.History): void {
    this.learnFilterUriParam = getUpdatedURIFromSelectedFilters(
      this.selectedFilter,
      this.expandedProducts,
      this.productMap
    );
    history.push({
      pathname: history.location.pathname,
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
