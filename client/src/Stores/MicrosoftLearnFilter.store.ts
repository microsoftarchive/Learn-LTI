import _ from "lodash";
import { action, observable } from "mobx";
import { toObservable } from "../Core/Utils/Mobx/toObservable";
import { getRegexs, scoreRegex } from "../Features/MicrosoftLearn/MicrosoftLearnFilterUtils";
import { Catalog, LearnContent, Product } from "../Models/Learn";
import { FilterType } from "../Models/Learn/FilterType.model";
import { MicrosoftLearnStore } from "./MicrosoftLearn.store";
import { debounceTime, map, filter, tap } from 'rxjs/operators';

export class MicrosoftLearnFilterStore extends MicrosoftLearnStore{
    @observable displayFilters: Map<FilterType, string[]> = new Map([
        [FilterType.Product, []],
        [FilterType.Role, []],
        [FilterType.Level, []],
        [FilterType.Type, []]]);

    @observable selectedFilters: Map<FilterType, string[]> = new Map([
        [FilterType.Product, []],
        [FilterType.Role, []],
        [FilterType.Level, []],
        [FilterType.Type, []]]);  

    @observable searchTerm: string = '';
    @observable learnFilterUriParam: string = '';
    @observable expandedProducts: string[]=[];
    @observable filteredCatalogContent: LearnContent[] | null = null;
    @observable productMap: Map<Product, Product[]>  = new Map<Product, Product[]>(); 

    constructor(){
        super();
        this.catalog=null;
    }

    initialize(): void {
        toObservable(() => this.searchTerm)
          .pipe(
            debounceTime(250),
            tap(() => (this.filteredCatalogContent = [])),
            map(searchTerm => getRegexs(searchTerm)),
            filter(() => !!this.catalog),
            map(expressions => this.applySelectedFilter(false, expressions))
          )
          .subscribe((filteredCatalogContent) => (this.filteredCatalogContent = filteredCatalogContent))
    }

    public initializeFilters(catalog: Catalog){
        this.catalog = catalog;
        this.filteredCatalogContent = [...catalog.contents.values()];
        this.productMap = this.getProductHierarchicalMap();
        this.setDisplayFilters(this.filteredCatalogContent, false);
        this.loadFiltersFromPath();
    }

    public updateSearchTerm(newTerm: string){
        this.searchTerm = newTerm;
    }

    @action 
    updateExpandedProducts(action: boolean, id: string){
        action? this.expandedProducts.push(id) :
                this.expandedProducts = this.expandedProducts.filter(pId => pId!==id);
        this.updateURI();
    }
    
    @action
    public addFilter(type: FilterType, filters: string[]){
        let currentFilters = this.selectedFilters.get(type);
        if(currentFilters){
         this.selectedFilters.set(type, [...currentFilters, ...filters]);
        }
        this.filteredCatalogContent = this.applySelectedFilter(true);
    }

    @action
    public removeFilter(type: FilterType, filters: string[]){
        let currentFilters = this.selectedFilters.get(type);
        if(currentFilters){
          this.selectedFilters.set(type, currentFilters?.filter(item => !filters.includes(item)));
        }
        this.filteredCatalogContent = this.applySelectedFilter(true);
    }

    @action
    public  resetFilter(){
        this.selectedFilters.set(FilterType.Product, []);
        this.selectedFilters.set(FilterType.Role, []);
        this.selectedFilters.set(FilterType.Type, []);
        this.selectedFilters.set(FilterType.Level, []);     
        
        this.filteredCatalogContent = [...this.catalog?.contents.values()]; 
        this.setDisplayFilters(this.filteredCatalogContent, false);
        this.updateURI();
    }
    
    @action
    public applySelectedFilter (removeExtra: boolean, searchExpressions?: RegExp[]) {
            let productFilter = this.selectedFilters.get(FilterType.Product) || [];
            let roleFilter = this.selectedFilters.get(FilterType.Role) || [];
            let typeFilter = this.selectedFilters.get(FilterType.Type) || [];
            let levelFilter = this.selectedFilters.get(FilterType.Level) || [];
            let _filteredCatalogContent :LearnContent[] =  [...this.catalog?.contents.values()]    
                                        .filter(content => (
                                          ((productFilter.length===0 || _.intersection(content.products, productFilter).length>0) &&
                                          (roleFilter.length===0 || _.intersection(content.roles, roleFilter).length>0) &&
                                          (levelFilter.length===0 || _.intersection(content.levels, levelFilter).length>0) &&
                                          (typeFilter.length===0 || _.intersection([content.type], typeFilter).length>0)
                                          )))                      

            _filteredCatalogContent = searchExpressions? this.getSearchTermFilteredLearnContent(searchExpressions, _filteredCatalogContent)
                                            : this.getSearchTermFilteredLearnContent(getRegexs(this.searchTerm), _filteredCatalogContent);
           
            this.setDisplayFilters(_filteredCatalogContent, removeExtra);
            this.updateURI();
            return _filteredCatalogContent;
    }
    
    @action
    public removeExtrasFromSelected (type: FilterType) {
      if(type===FilterType.Product){
            let parentProducts = [...this.productMap.keys()]; 
            let prevSelected = this.selectedFilters.get(type);
            let newDisplay = this.displayFilters.get(type);
            const selectedInvisibleItems = prevSelected?.filter(item => newDisplay && !newDisplay.includes(item))
          
            let removeParentProducts = parentProducts?.filter(parent => selectedInvisibleItems?.includes(parent.id)).map(parent => parent.id);
            let removeChilrenProducts = [...this.catalog?.products.values()]
                                        .filter(product => (product.parentId && (removeParentProducts.includes(product.parentId) ||
                                        (!prevSelected?.includes(product.parentId) && prevSelected?.includes(product.id) && !newDisplay?.includes(product.id)))))
                                        .map(product => product.id);

            let removeProducts = [...removeParentProducts, ...removeChilrenProducts];
            let newSelected = prevSelected?.filter(item => !removeProducts.includes(item));
            if(newSelected!==undefined){
            this.selectedFilters.set(type, newSelected);
            }
        }
    
        else{
          let prevSelected = this.selectedFilters.get(type);
          let newDisplay = this.displayFilters.get(type);
          if(prevSelected!==undefined && newDisplay!==undefined){
            this.selectedFilters.set(type, _.intersection(prevSelected, newDisplay));
          }
        }
    }
        
    @action
    public  setDisplayFilters (filteredContent: LearnContent[], removeExtra: boolean) {
        let filteredProducts = new Set<string>();
        let filteredRoles = new Set<string>(_.flatten(filteredContent.map(content => content.roles)));
        let filteredTypes = new Set<string>(_.flatten(filteredContent.map(content => [content.type])));
        let filteredLevels = new Set<string>(_.flatten(filteredContent.map(content => content.levels)));
    
        const products = _.flatten(filteredContent.map(content => content.products));

        // For multi-hierarchy
        // Add all ancestors instead of just parents.
        const parents = products.map(product => this.catalog?.products.get(product)?.parentId || '').filter(pId => pId.length>0)
        filteredProducts = new Set([...parents, ...products]);

        this.displayFilters.set(FilterType.Product, [...filteredProducts]);
        this.displayFilters.set(FilterType.Role, [...filteredRoles]);
        this.displayFilters.set(FilterType.Level, [...filteredLevels]);
        this.displayFilters.set(FilterType.Type, [...filteredTypes]);
    
        if(removeExtra){
          this.removeExtrasFromSelected(FilterType.Product);
          this.removeExtrasFromSelected(FilterType.Role);
          this.removeExtrasFromSelected(FilterType.Level);
          this.removeExtrasFromSelected(FilterType.Type);
        }
    }        

    private updateURI() {
        let productFilter = this.selectedFilters.get(FilterType.Product) || [];
        let roleFilter = this.selectedFilters.get(FilterType.Role) || [];
        let typeFilter = this.selectedFilters.get(FilterType.Type) || [];
        let levelFilter = this.selectedFilters.get(FilterType.Level) || [];
  
        const getProductUri = () => {
          let parents = [...this.productMap.keys()]; 
          let keep: string[] = [];
          let parentProductFilters: Product[] = parents.filter(p => productFilter.includes(p.id));
          let invisibleChildren = _.flatten(parentProductFilters.map(parent => this.productMap.get(parent)?.map(c=>c.id)));
          // For multi-hierarchy
          // keep = keep.filter(p => !invisibleChildren.includes(p))
          keep = [...keep, ...productFilter.filter(f => !keep.includes(f) && !invisibleChildren.includes(f))];
          return 'products='+keep.join('%2C');
        }
  
        let productUri = productFilter.length>0? getProductUri() : '';
        let roleUri = roleFilter.length>0? 'roles=' + roleFilter.join('%2C') : '';
        let typeUri = typeFilter.length>0? 'types=' + typeFilter.join('%2C') : '';
        let levelUri = levelFilter.length>0? 'levels=' + levelFilter.join('%2C') : '';
        let termsUri = this.searchTerm.length>0? 'terms='+this.searchTerm : '';
        let expandedProductsUri = this.expandedProducts.length>0? 'expanded='+this.expandedProducts.join('%2C') : '';
        let finalUri = [productUri, roleUri, levelUri, typeUri, termsUri, expandedProductsUri]
                        .filter(s=>s.length!==0).join('&')            
  
        let uri = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + finalUri;
        window.history.pushState({path:uri},'',uri);       
  
        this.learnFilterUriParam = finalUri;
    }
  
    private getSearchTermFilteredLearnContent(expressions: RegExp[], content: LearnContent[]): LearnContent[] {
        return content
          .map(course => ({
            course: course,
            score: _.sumBy(
              expressions,
              singleExpression =>
                scoreRegex(course.summary, singleExpression) + scoreRegex(course.title, singleExpression, 2)
            )
          }))
          .filter(scouredCourse => scouredCourse.score > 0)
          .sort((a, b) => b.score - a.score)
          .map(scoredCourse => scoredCourse.course);
    }

    private loadFiltersFromPath(){
        let searchParams = window.location.search
        if(searchParams.length>0){
          let searchParamMap: Map<string, string[]> = new Map<string, string[]>();
          searchParams.slice(1).split('&').forEach(s=>{
            let [key, value] = s.split('=');
            searchParamMap.set(key, value.split('%2C'));
          })
    
          this.expandedProducts = searchParamMap.get("expanded") || [];
          this.selectedFilters.set(FilterType.Role, searchParamMap.get('roles') || []);
          this.selectedFilters.set(FilterType.Level, searchParamMap.get('levels') || []);
          this.selectedFilters.set(FilterType.Type, searchParamMap.get('types') || []);
    
          let setProducts = searchParamMap.get('products');
          if(setProducts){
            let parents = [...this.productMap.keys()];
            let parenIds = parents.map(p => p.id);
            
            let selectedParents = setProducts.filter(p => parenIds.includes(p)).map(pId => this.catalog?.products.get(pId)!!); 
            let addChildren = _.flatten(selectedParents.map(p => this.productMap.get(p)!!)).map(c=>c.id);
            this.selectedFilters.set(FilterType.Product,  [...setProducts, ...addChildren]);
          }
          this.filteredCatalogContent = this.applySelectedFilter(true);
    
          let searchTerm = searchParamMap.get("terms");
          if(searchTerm){
            this.updateSearchTerm(searchTerm[0].split('%20').join(' '));
          }
        }
      }

    private getProductHierarchicalMap = () => {
        let productParentChildMap = new Map<Product, Product[]>();
        let productMap = this.catalog?.products;
        if(productMap!=null){        
    
          // For multi-hierarchy:
          // Assuming that the catalog.products structure would have mapped all the product ids to corresponding product objects (slight modifications to the dtos and getProducts function would be needed)
          // we can extend the productHierarchicalMap by having keys for all those children as well which have further sub items; for instance:
          // P1
          //    -C1
          //       -GC1
          //       -GC2
          // P2
          //    -C2
          // 
          // The above structure would appear in the productHierarchicalMap (productParentChildMap) as:
          // P1: [C1]
          // P2: [C2]
          // C1: [GC1, GC2]
          // 
          // The following piece of code could be used in that case, and most of the remaining logic would also need only slight changes.
          //
          //  [...productMap.values()].forEach((item) => {
          //   let children = [...productMap?.values()].filter(product => product.parentId!==null && product.parentId===item.id);
          //   if(children.length>0){
          //     productParentChildMap.set(item, children);
          //   }
          // });
    
          [...productMap.values()].filter(item => item?.parentId==null)
            .forEach((k)=>{
              let children = [...productMap?.values()].filter(product => product.parentId!==null && product.parentId===k.id)
              productParentChildMap.set(k, children);
            });
        }
        return productParentChildMap
    }
}