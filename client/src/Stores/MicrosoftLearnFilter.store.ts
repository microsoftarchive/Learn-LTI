/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import _ from "lodash";
import { action, observable } from "mobx";
import { getfiltersToDisplay, loadFiltersFromQueryParams, loadExpandedProductsFromQueryParams, getUpdatedURIfromSelectedFilters } from "../Features/MicrosoftLearn/MicrosoftLearnFilterCore";
import { Catalog, LearnContent, Product } from "../Models/Learn";
import { FilterType } from "../Models/Learn/FilterType.model";
import { ChildStore } from "./Core";
import { Filter } from "../Models/Learn/Filter.model";
import * as H from 'history';

export class MicrosoftLearnFilterStore extends ChildStore{
  @observable displayFilter: Filter = new Filter();
  @observable selectedFilter: Filter = new Filter();
  @observable learnFilterUriParam: string = '';
  @observable expandedProducts: string[]=[];

  productMap: Map<string, Product>  = new Map<string, Product>(); 

  public initializeFilters(catalog: Catalog, filterParams: URLSearchParams | undefined): void{
    this.productMap = catalog.products;
    //this.getProductHierarchicalMap(catalog);
    
    if(filterParams){
      this.selectedFilter = loadFiltersFromQueryParams(filterParams, this.productMap);
      this.expandedProducts = loadExpandedProductsFromQueryParams(filterParams);
    }
  }

  @action
  updateSearchTerm(newTerm: string, history: H.History): void{
    this.selectedFilter.terms = newTerm.split(' ')
    this.clone();
    this.updateHistory(history);
  }

  @action
  updateExpandedProducts(action: boolean, id: string, history: H.History): void{
    action? this.expandedProducts.push(id) :
      this.expandedProducts = this.expandedProducts.filter(pId => pId!==id);                
    this.updateHistory(history);
  }
  
  @action
  addFilter(type: FilterType, filters: string[], history: H.History): void{
    this.selectedFilter.set(type, [...this.selectedFilter.get(type), ...filters]);
    this.clone();
    this.updateHistory(history);
  }

  @action
  removeFilter(type: FilterType, filters: string[], history: H.History): void{
    this.selectedFilter.set(type, this.selectedFilter.get(type).filter(item => !filters.includes(item)));
    this.clone();
    this.updateHistory(history);
  }

  @action
  resetFilter(history: H.History): void{
    [FilterType.products, FilterType.roles, FilterType.types, FilterType.levels, FilterType.terms]
      .forEach(type => this.selectedFilter.set(type, []));
    this.clone();
    this.updateHistory(history);
  }

  public updateFiltersToDisplay(catalog: Catalog | null, filteredCatalogContent: LearnContent[] | null): Filter{
    return  getfiltersToDisplay(catalog, filteredCatalogContent || []);
  }    

  private clone(): void{
    this.selectedFilter = _.clone(this.selectedFilter);
  }

  private updateHistory(history: H.History): void{
    this.learnFilterUriParam = getUpdatedURIfromSelectedFilters(this.selectedFilter, this.expandedProducts, this.productMap);        
    history.push('./ms-learn' + (this.learnFilterUriParam.length>0? '?' + this.learnFilterUriParam : ''));
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