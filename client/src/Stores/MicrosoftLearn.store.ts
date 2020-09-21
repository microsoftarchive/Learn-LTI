import { ChildStore } from './Core';
import { observable, action } from 'mobx';
import { Catalog, Product, LearnContent } from '../Models/Learn';
import { MicrosoftLearnService } from '../Services/MicrosoftLearn.service';
import { CatalogDto, ProductChildDto, ProductDto } from '../Dtos/Learn';
import { toMap } from '../Core/Utils/Typescript/ToMap';
import { debounceTime, map, filter, switchMap, tap } from 'rxjs/operators';
// import _ from 'lodash';
import { toObservable } from '../Core/Utils/Mobx/toObservable';
import { AssignmentLearnContent } from '../Models/Learn/AssignmentLearnContent';
import { AssignmentLearnContentDto } from '../Dtos/Learn/AssignmentLearnContent.dto';
import { FilterType } from '../Models/Learn/FilterType.model'; 
import { Filter } from '../Models/Learn/Filter.model';
import _ from 'lodash';

export class MicrosoftLearnStore extends ChildStore {
  @observable isLoadingCatalog: boolean | null = null;
  @observable catalog: Catalog | null = null;
  @observable selectedItems: AssignmentLearnContent[] | null = null;
  @observable filteredCatalogContent: LearnContent[] | null = null;
  @observable searchTerm = '';
  @observable productMap: Map<Product, Product[]>  = new Map<Product, Product[]>(); 
  @observable filter: Filter = new Filter(this.catalog, this.productMap);


  initialize(): void {
    toObservable(() => this.searchTerm)
      .pipe(
        debounceTime(250),
        tap(() => (this.filteredCatalogContent = [])),
        map(searchTerm => this.getRegexs(searchTerm)),
        filter(() => !!this.catalog),
        map(expressions => this.applyFilter(false, expressions))
      )
      .subscribe((filteredCatalogContent) => (this.filteredCatalogContent = filteredCatalogContent))

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
    if(this.filter){
      this.filter.updateSearchTerm(searchTerm);
    } 
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

    this.filter.catalog = this.catalog;
    this.filter.productMap = this.productMap;
    this.filter.setDisplayFilters(this.filteredCatalogContent, false);

    this.loadFiltersFromPath();
  }

  @action
  addFilter(type: FilterType, filters: string[]){
    if(this.filter){
      let _filteredCatalogContent = this.filter?.addFilter(type, filters); 
      this.filteredCatalogContent = _filteredCatalogContent
    }
  }

  @action
  removeFilter(type: FilterType, filters: string[]){
    if(this.filter){
      let _filteredCatalogContent = this.filter?.removeFilter(type, filters);
      this.filteredCatalogContent = _filteredCatalogContent
    }
  }

  @action
  resetFilter(){
    if(this.filter){
      let _filteredCatalogContent = this.filter.resetFilter();
      this.filteredCatalogContent = _filteredCatalogContent
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
          let children = [...productMap?.values()].filter(product => product.parentId!=null && product.parentId===k.id)
          productParentChildMap.set(k, children);
        });
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

  private applyFilter (removeExtra: boolean, searchExpressions?: RegExp[]) {
    if(this.filter){
      let _filteredCatalogContent = this.filter.applyFilter(removeExtra, searchExpressions)
      return _filteredCatalogContent
    }                  
    return null;
  }

  private loadFiltersFromPath(){
    let searchParams = window.location.search
    if(searchParams.length>0){
      let searchParamMap: Map<string, string[]> = new Map<string, string[]>();
      searchParams.slice(1).split('&').forEach(s=>{
        let [key, value] = s.split('=');
        searchParamMap.set(key, value.split('%2C'));
      })

      let setRoles = searchParamMap.get('roles')
      if(setRoles){
        this.filter.selectedFilters.set(FilterType.Role, setRoles);
      }

      let setLevels = searchParamMap.get('levels');
      if(setLevels){
        this.filter.selectedFilters.set(FilterType.Level, setLevels);
      }

      let setTypes = searchParamMap.get('types');
      if(setTypes){
        this.filter.selectedFilters.set(FilterType.Type, setTypes);
      }

      let setProducts = searchParamMap.get('products');
      if(setProducts){
        let parents = [...this.productMap.keys()];
        let parenIds = parents.map(p => p.id);
        
        let selectedParents = setProducts.filter(p => parenIds.includes(p)).map(pId => this.catalog?.products.get(pId)!!); 
        let addChildren = _.flatten(selectedParents.map(p => this.productMap.get(p)!!)).map(c=>c.id);
        setProducts = [...setProducts, ...addChildren];
        this.filter.selectedFilters.set(FilterType.Product, setProducts);
      }

      this.filteredCatalogContent = this.applyFilter(true);

      let searchTerm = searchParamMap.get("terms");
      if(searchTerm){
        this.updateSearchTerm(searchTerm[0].split('%20').join(' '));
      }

      let expandedProducts = searchParamMap.get("expanded");
      if(expandedProducts){
        this.filter.expandedProducts = expandedProducts;
      }
    }
  }
}