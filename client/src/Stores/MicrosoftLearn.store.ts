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
    this.searchTerm = searchTerm;
    if(this.filter){
      this.filter.updateSearchTerm(searchTerm);
    }
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
        [...productMap.values()].filter(item => item?.parentId==null)
        .forEach((k)=>{
          let children = [...productMap?.values()].filter(product => product.parentId!=null && product.parentId===k.id)
          productParentChildMap.set(k, children);
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

  private applyFilter (removeExtra: boolean, searchExpressions?: RegExp[]) {
    if(this.filter){
      let _filteredCatalogContent = this.filter.applyFilter(removeExtra, searchExpressions)
      return _filteredCatalogContent
    }                  
    return null;
  }
}