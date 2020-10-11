/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { ChildStore } from './Core';
import { observable, action } from 'mobx';
import { Catalog, Product, LearnContent } from '../Models/Learn';
import { MicrosoftLearnService } from '../Services/MicrosoftLearn.service';
import { CatalogDto, ProductChildDto, ProductDto } from '../Dtos/Learn';
import { toMap } from '../Core/Utils/Typescript/ToMap';
import { debounceTime, map, filter, tap, switchMap } from 'rxjs/operators';
import _ from 'lodash';
import { toObservable } from '../Core/Utils/Mobx/toObservable';
import { AssignmentLearnContent } from '../Models/Learn/AssignmentLearnContent';
import { AssignmentLearnContentDto } from '../Dtos/Learn/AssignmentLearnContent.dto';

export class MicrosoftLearnStore extends ChildStore {
  @observable isLoadingCatalog: boolean | null = null;
  @observable catalog: Catalog | null = null;
  @observable selectedItems: AssignmentLearnContent[] | null = null;
  @observable syncedSelectedItems: AssignmentLearnContent[] | null = null; 
  @observable filteredCatalogContent: LearnContent[] | null = null;
  @observable searchTerm = '';
  @observable serviceCallInProgress: number = 0;
  @observable isSynced: boolean | null = null;

  initialize(): void {
    toObservable(() => this.searchTerm)
      .pipe(
        debounceTime(250),
        tap(() => (this.filteredCatalogContent = [])),
        map(searchTerm => this.getRegexs(searchTerm)),
        filter(() => !!this.catalog),
        map(expressions => this.getFilteredLearnContent(expressions, this.catalog!))
      )
      .subscribe(filteredCatalog => (this.filteredCatalogContent = filteredCatalog));

    toObservable(() => this.root.assignmentStore.assignment)
      .pipe(
        filter(assignment => !!assignment),
        map(assignment => assignment!.id),
        switchMap(assignmentId => MicrosoftLearnService.getAssignmentLearnContent(assignmentId)),
        filter(assignmentLearnContent => !assignmentLearnContent.error),
        map(assignmentLearnContent => assignmentLearnContent as AssignmentLearnContentDto[])
      )
      .subscribe(selectedItems => {
        this.selectedItems = selectedItems; 
        this.syncedSelectedItems = selectedItems; 
        this.isSynced = true; 
      });
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

      this.serviceCallInProgress++; 
      MicrosoftLearnService.saveAssignmentLearnContent(assignmentId, learnContentUid)
        .then(hasError => {
          if (hasError === null){
            this.syncedSelectedItems?.push({ contentUid: learnContentUid });
          }
          this.serviceCallInProgress--; 
          this.isSynced = _.isEqual(this.selectedItems, this.syncedSelectedItems);
        })
    }
  }

  @action
  clearAssignmentLearnContent(): void {
    this.selectedItems = [];
    const assignmentId = this.root.assignmentStore.assignment!.id;

    this.serviceCallInProgress++; 
    MicrosoftLearnService.clearAssignmentLearnContent(assignmentId)
      .then(hasError => {
        if (hasError === null){
          this.syncedSelectedItems = [];
        }
        this.serviceCallInProgress--; 
        this.isSynced = _.isEqual(this.selectedItems, this.syncedSelectedItems);
      })  
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

    this.serviceCallInProgress++; 
    MicrosoftLearnService.removeAssignmentLearnContent(assignmentId, learnContentUid)
      .then(hasError => {
        if (hasError === null){
          this.syncedSelectedItems?.splice(itemIndexInSelectedItemsList, 1);
        }
        this.serviceCallInProgress--; 
        this.isSynced = _.isEqual(this.selectedItems, this.syncedSelectedItems);
      })
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

  private getFilteredLearnContent(expressions: RegExp[], catalog: Catalog): LearnContent[] {
    return Array.from(catalog.contents.values())
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
