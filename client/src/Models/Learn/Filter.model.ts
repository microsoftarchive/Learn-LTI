import _ from "lodash";
import { Catalog } from "./Catalog.model";
import { FilterType } from "./FilterType.model";
import { LearnContent } from "./LearnContent.model";
import { Product } from "./Product.model";
import { observable, action } from "mobx";

export class Filter {
    @observable displayFilters: Map<FilterType, string[]>;
    @observable selectedFilters: Map<FilterType, string[]>;
    @observable catalog: Catalog | null;
    @observable productMap: Map<Product, Product[]>
    @observable searchTerm: string;
    @observable learnFilterUriParam: string = '';
    constructor(catalog: Catalog | null, productMap: Map<Product, Product[]>){
        this.displayFilters = new Map([
            [FilterType.Product, []],
            [FilterType.Role, []],
            [FilterType.Level, []],
            [FilterType.Type, []]]);
                    
        this.selectedFilters  = new Map([
            [FilterType.Product, []],
            [FilterType.Role, []],
            [FilterType.Level, []],
            [FilterType.Type, []]]); 

        this.catalog = catalog;   
        this.productMap = productMap;     
        this.searchTerm = '';
    }
        
    public updateSearchTerm(newTerm: string){
        this.searchTerm = newTerm;
    }

    @action
    public addFilter(type: FilterType, filters: string[]){
        let currentFilters = this.selectedFilters.get(type);
        if(currentFilters){
         filters.forEach((f)=>{
           currentFilters?.push(f);
         })
         this.selectedFilters.set(type, currentFilters);
        }
        return this.applyFilter(true);
    }

    @action
    public removeFilter(type: FilterType, filters: string[]){
        let currentFilters = this.selectedFilters.get(type);
        if(currentFilters){
          currentFilters = currentFilters?.filter(item => !filters.includes(item))
          this.selectedFilters.set(type, currentFilters);
        }
        return this.applyFilter(true);
    }

    @action
    public  resetFilter(){
        this.selectedFilters.set(FilterType.Product, []);
        this.selectedFilters.set(FilterType.Role, []);
        this.selectedFilters.set(FilterType.Type, []);
        this.selectedFilters.set(FilterType.Level, []);
        
        return this.applyFilter(true);
      }
    
    @action
    public applyFilter (removeExtra: boolean, searchExpressions?: RegExp[]) {
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

            _filteredCatalogContent = searchExpressions?
            this.getSearchTermFilteredLearnContent(searchExpressions, _filteredCatalogContent)
            : this.getSearchTermFilteredLearnContent(this.getRegexs(this.searchTerm), _filteredCatalogContent);
           
            this.setDisplayFilters(_filteredCatalogContent, removeExtra);

            const getProductUri = () => {
                let parents = [...this.productMap.keys()]; 
                let keep: string[] = [];
                let invisibleChildren: string[] = [];
                productFilter.forEach(f=>{                    
                    if(parents.filter(p => p.id == f).length > 0){
                        let parent = parents.filter(p => p.id == f)[0];
                        keep.push(f);
                        invisibleChildren = [...invisibleChildren, ...this.productMap.get(parent)?.map(c=>c.id)]
                    }
                })
                
                keep = [...keep, ...productFilter.filter(f => !keep.includes(f) && !invisibleChildren.includes(f))];
                return 'products='+keep.join('%2C');
            }

            let productUri = productFilter.length>0? getProductUri() : '';
            let roleUri = roleFilter.length>0? 'roles=' + roleFilter.join('%2C') : '';
            let typeUri = typeFilter.length>0? 'types=' + typeFilter.join('%2C') : '';
            let levelUri = levelFilter.length>0? 'levels=' + levelFilter.join('%2C') : '';
            let termsUri = this.searchTerm.length>0? 'terms='+this.searchTerm : '';
            let finalUri = [productUri, roleUri, levelUri, typeUri, termsUri].filter(s=>s.length!=0).join('&')            

            let uri = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + finalUri;
            window.history.pushState({path:uri},'',uri);       

            this.learnFilterUriParam = finalUri;
            return _filteredCatalogContent
          }

          @action
          public removeExtrasFromSelected (type: FilterType) {
            if(type===FilterType.Product){
                  let parentProducts = [...this.productMap.keys()] 
                  let prevSelected = this.selectedFilters.get(type);
                  let newDisplay = this.displayFilters.get(type);
                  const selectedInvisibleItems = prevSelected?.filter(item => newDisplay && !newDisplay.includes(item))
                
                  let removeParentProducts = parentProducts?.filter(parent => selectedInvisibleItems?.includes(parent.id)).map(parent => parent.id);
                  let removeChilrenProducts = [...this.catalog?.products.values()].filter(product => 
                    (product.parentId && (removeParentProducts.includes(product.parentId) ||
                    (!prevSelected?.includes(product.parentId) && prevSelected?.includes(product.id) && !newDisplay?.includes(product.id))))
                  ).map(product => product.id);
        
                  let removeProducts = [...removeParentProducts, ...removeChilrenProducts];
                  let newSelected = prevSelected?.filter(item => !removeProducts.includes(item) );
                  if(newSelected){
                  this.selectedFilters.set(type, newSelected);
                  }
              }
          
              else{
                let prevSelected = this.selectedFilters.get(type);
                let newDisplay = this.displayFilters.get(type);
                if(prevSelected && newDisplay){
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

          private getRegexs(searchTerm: string): RegExp[] {
            const expressions: RegExp[] = searchTerm
              .trim()
              .replace(/\s+/g, ' ')
              .split(' ')
              .map(termPart => new RegExp(`.*${termPart}.*`, 'i'));
            expressions.push(new RegExp(`.*${searchTerm}.*`, 'i'));
            return expressions;
          }
        
          private getSearchTermFilteredLearnContent(expressions: RegExp[], content: LearnContent[]): LearnContent[] {
            return content
              .map(course => ({
                course: course,
                score: _.sumBy(
                  expressions,
                  singleExpression =>
                    this.scoreRegex(course.summary, singleExpression) + this.scoreRegex(course.title, singleExpression, 2)
                )
              }))
              .filter(scouredCourse => scouredCourse.score > 0)
              .sort((a, b) => b.score - a.score)
              .map(scoredCourse => scoredCourse.course);
          }
        
          private scoreRegex(testPhrase: string, exp: RegExp, score = 1): number {
            return exp.test(testPhrase) ? score : 0;
          }
}