import _ from "lodash";
import { action, observable } from "mobx";
import { setDisplayFilters, loadFiltersFromPath, updateURI, getRegexs } from "../Features/MicrosoftLearn/MicrosoftLearnFilterCore";
import { Catalog, Product } from "../Models/Learn";
import { debounceTime, map, filter, tap, switchMap } from 'rxjs/operators';
import { FilterType } from "../Models/Learn/FilterType.model";
import { ChildStore } from "./Core";
import { Filter } from "../Models/Learn/Filter.model";

export class MicrosoftLearnFilterStore extends ChildStore{
  @observable displayFilter: Filter = new Filter();
  @observable selectedFilter: Filter = new Filter();

  @observable learnFilterUriParam: string = '';
  @observable expandedProducts: string[]=[];



    productMap: Map<Product, Product[]>  = new Map<Product, Product[]>(); 

    public initializeFilters(catalog: Catalog){
        this.productMap = this.getProductHierarchicalMap(catalog);
        this.displayFilters = setDisplayFilters(catalog, [...catalog.contents.values()]);
        let response = loadFiltersFromPath(catalog, this.productMap);

        if(response){
          this.expandedProducts = response?.expandedProducts;
          this.selectedFilters = response?.selectedFilters;
          this.searchTerm = response?.searchTerm;
        }
    }

    @action
    updateSearchTerm(newTerm: string){
        this.searchTerm = newTerm;
    }

    @action
    updateExpandedProducts(action: boolean, id: string){
        action? this.expandedProducts.push(id) :
                this.expandedProducts = this.expandedProducts.filter(pId => pId!==id);
        this.learnFilterUriParam = updateURI(this.selectedFilters, this.searchTerm, this.expandedProducts, this.productMap);
    }
    
    @action
    addFilter(type: FilterType, filters: string[]){
      let currentFilters = this.selectedFilters.get(type);
        if(currentFilters){
          this.selectedFilters.set(type, [...currentFilters, ...filters]);
        }
    }

    @action
    removeFilter(type: FilterType, filters: string[]){
      let currentFilters = this.selectedFilters.get(type);
        if(currentFilters){
          this.selectedFilters.set(type, currentFilters?.filter(item => !filters.includes(item)));
        }
    }

    @action
    resetFilter(){
        this.selectedFilters.set(FilterType.Product, []);
        this.selectedFilters.set(FilterType.Role, []);
        this.selectedFilters.set(FilterType.Type, []);
        this.selectedFilters.set(FilterType.Level, []);     
    }
    
    private getProductHierarchicalMap = (catalog: Catalog) => {
      let productParentChildMap = new Map<Product, Product[]>();
      let productMap = catalog?.products;
      if(productMap!=null){        
        [...productMap.values()].filter(item => item?.parentId==null)
          .forEach((k)=>{
            let children = [...productMap?.values()].filter(product => product.parentId!==null && product.parentId===k.id)
            productParentChildMap.set(k, children);
          });
      }
      return productParentChildMap
    }
}