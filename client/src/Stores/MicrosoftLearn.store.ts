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
import { FilterType } from '../Models/Learn/FilterType.model'; 

export class MicrosoftLearnStore extends ChildStore {
  @observable isLoadingCatalog: boolean | null = null;
  @observable catalog: Catalog | null = null;
  @observable selectedItems: AssignmentLearnContent[] | null = null;
  @observable filteredCatalogContent: LearnContent[] | null = null;
  @observable searchTerm = '';
  @observable displayFilters: Map<FilterType, string[]> = new Map([
                                                            [FilterType.Product, []],
                                                            [FilterType.Role, []],
                                                            [FilterType.Level, []],
                                                            [FilterType.Type, []]
                                                                    ]);;
  @observable selectedFilters: Map<FilterType, string[]> = new Map([
                                                            [FilterType.Product, []],
                                                            [FilterType.Role, []],
                                                            [FilterType.Level, []],
                                                            [FilterType.Type, []]
                                                                    ]);
  @observable productMap: Map<Product, Product[]>  = new Map<Product, Product[]>(); 

  initialize(): void {
    toObservable(() => this.searchTerm)
      .pipe(
        debounceTime(250),
        // tap(() => (this.filteredCatalogContent = [])),
        map(searchTerm => this.getRegexs(searchTerm)),
        filter(() => !!this.catalog),
        // map(expressions => this.getFilteredLearnContent(expressions, this.catalog!))
        map(expression => this.applyFilter(false))
      )
      .subscribe(filteredCatalog => (this.filteredCatalogContent));

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
    this.filteredCatalogContent = allItems;
    this.isLoadingCatalog = false;
    this.productMap = this.getProductHierarchicalMap();
    this.setDisplayFilters(this.filteredCatalogContent, false);
  }

  @action
  addFilter(type: FilterType, filters: string[]){
     let currentFilters = this.selectedFilters.get(type);
     if(currentFilters){
      filters.forEach((f)=>{
        currentFilters?.push(f);
      })
      this.selectedFilters.set(type, currentFilters);
     }
     this.applyFilter(true);
  }

  @action
  removeFilter(type: FilterType, filters: string[]){
    let currentFilters = this.selectedFilters.get(type);
    if(currentFilters){
      currentFilters = currentFilters?.filter(item => !filters.includes(item))
      this.selectedFilters.set(type, currentFilters);
    }
    this.applyFilter(true);
  }

  private getProductHierarchicalMap = () => {
    // O(|Products|)
    let productParentChildMap = new Map<Product, Product[]>();
    let productMap = this.catalog?.products;
    var parentProducts;
    if(productMap!=null){        
        parentProducts = Array.from(productMap.values()).filter(item => item?.parentId==null)
        parentProducts.forEach((k)=>{
          productParentChildMap.set(k, []);
        })
        productMap.forEach((item)=>{
            if(item !=null && item.parentId!=null){
               let parentItem = productMap?.get(item.parentId);
               if(parentItem!=null){                
                let previousChildren = productParentChildMap.get(parentItem);                  
                if(previousChildren!=null){
                  previousChildren.push(item);                    
                  productParentChildMap.set(parentItem, previousChildren);
                }
               }
            }
        }) 
      }
      return productParentChildMap
  }

  private getItemIndexInSelectedList = (learnContentUid: string): number | void => {
    return this.selectedItems?.findIndex(item => item.contentUid === learnContentUid);
  };
;
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
  };

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
    // O(|catalog?.content|)
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

    // O(|filtertype|)
  private removeExtrasFromSelected = (type: FilterType) => {
    if(type===FilterType.Product){
    
          let parentProducts = Array.from(this.productMap.keys());
  
          // CASE 1: check for parent products which are there in selectedFilter but not in displayFilter. Remove all of them from selectedFilter, along with all their children.
          // CASE 2: check for individual product filters whose parent is not in selected filter, but it is, and the current state of displayFilter does not. Remove them from selectedFilter.
  
          let prevSelected = this.selectedFilters.get(type);
          let newDisplay = this.displayFilters.get(type);
          let removeProducts: string[] = []
          parentProducts?.forEach(item=>{
          if(newDisplay && prevSelected){
            if(prevSelected.includes(item.id) && !newDisplay.includes(item.id))
                  removeProducts.push(item.id);
          }
          })
          let productIter = this.catalog?.products.values();
          let _n = 0;
          while(this.catalog?.products.size && _n<this.catalog?.products.size){
            let p = productIter?.next().value;
            if((removeProducts.includes(p.parentId) ||
            (!prevSelected?.includes(p.parentId) && prevSelected?.includes(p.id) && !newDisplay?.includes(p.id)))){
                removeProducts.push(p.id);
            }
            _n=_n+1;
          }
          let newSelected = prevSelected?.filter(item => !removeProducts.includes(item) );
        if(newSelected){
          this.selectedFilters.set(type, newSelected);
        }
      }
  
      else{
        let prevSelected = this.selectedFilters.get(type);
        let newDisplay = this.displayFilters.get(type);
        if(prevSelected && newDisplay){
          let newSelected = prevSelected.filter(item =>  newDisplay && newDisplay.includes(item));
          this.selectedFilters.set(type, newSelected);
        }
      }
  }

  private setDisplayFilters = (filteredContent: LearnContent[], removeExtra: boolean) => {
    let filteredProducts = new Set<string>();
    let filteredRoles = new Set<string>();
    let filteredTypes = new Set<string>();
    let filteredLevels = new Set<string>();

    // O(|catalog?.content|)
    filteredContent.forEach((content)=>{
      content.products.forEach((product)=>{
        filteredProducts.add(product);
        let parentProduct = this.catalog?.products.get(product)?.parentId
        if(parentProduct){
          filteredProducts.add(parentProduct);
        }        
      });
         
      content.roles.forEach((role)=>{
        filteredRoles.add(role);
      });

      filteredTypes.add(content.type);

      content.levels.forEach((level)=>{
        filteredLevels.add(level);
      });

    })

    this.displayFilters.set(FilterType.Product, Array.from(filteredProducts));
    this.displayFilters.set(FilterType.Role, Array.from(filteredRoles));
    this.displayFilters.set(FilterType.Level, Array.from(filteredLevels));
    this.displayFilters.set(FilterType.Type, Array.from(filteredTypes));

    // O(|Products|)
    if(removeExtra){
      // remove those selected filters which are now not in display filter
      this.removeExtrasFromSelected(FilterType.Product);
      this.removeExtrasFromSelected(FilterType.Role);
      this.removeExtrasFromSelected(FilterType.Level);
      this.removeExtrasFromSelected(FilterType.Type);
    }
  }

  private applyFilter = (removeExtra: boolean) => {

    let productFilter = this.selectedFilters.get(FilterType.Product);
    let roleFilter = this.selectedFilters.get(FilterType.Role);
    let typeFilter = this.selectedFilters.get(FilterType.Type);
    let levelFilter = this.selectedFilters.get(FilterType.Level);

    const intersect = (a1:string[], a2:string[]|undefined)=>{   
      if(a2?.length === 0){
        return true;
      } 
      a1 = a1.filter(item=> a2?.indexOf(item)!==-1)   
      return a1.length!==0;
    }

    let _filteredCatalogContent: LearnContent[] = []
    const iter = this.catalog?.contents.values();
    let _n=0;

    // O(|catalog?.content|)
    while(this.catalog?.contents?.size && _n<this.catalog?.contents?.size){
      let content = iter?.next().value;
      if(intersect(content.products, productFilter) && intersect(content.roles, roleFilter) && intersect(content.levels, levelFilter) && intersect([content.type], typeFilter) ){
        _filteredCatalogContent.push(content);
      }
      _n=_n+1;
    }

    let expressions = this.getRegexs(this.searchTerm)

    // O(|catalog?.content|)
    _filteredCatalogContent = this.getSearchTermFilteredLearnContent(expressions, _filteredCatalogContent); 
    this.filteredCatalogContent = _filteredCatalogContent;

    // O(|catalog?.content|)    
    this.setDisplayFilters(this.filteredCatalogContent, removeExtra);
    return this.filteredCatalogContent;
  }
}