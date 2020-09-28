/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import _ from 'lodash';
import { Catalog, Product, LearnContent } from '../../Models/Learn';
import { Filter } from '../../Models/Learn/Filter.model';

export function applySelectedFilter(catalog: Catalog | null, selectedFilters: Filter): LearnContent[] {
  return getSearchTermFilteredLearnContent(getRegexs(selectedFilters.terms.join(' ')), [...catalog?.contents.values()])
    .filter(content => filterBy(selectedFilters.products, content.products))
    .filter(content => filterBy(selectedFilters.roles, content.roles))
    .filter(content => filterBy(selectedFilters.levels, content.levels))
    .filter(content => filterBy(selectedFilters.types, [content.type]));

  function filterBy(filter: string[], catalog: string[]): boolean {
    return filter.length === 0 || filter.filter(value => catalog.includes(value)).length > 0;
  }
}

export function getfiltersToDisplay(catalog: Catalog | null, filteredContent: LearnContent[]): Filter {
  const newDisplayFilter = new Filter();

  const filteredProducts = new Set(getFilteredProducts());
  const filteredRoles = new Set(getFiltered(content => content.roles));
  const filteredTypes = new Set(getFiltered(content => [content.type]));
  const filteredLevels = new Set(getFiltered(content => content.levels));

  newDisplayFilter.products = [...filteredProducts];
  newDisplayFilter.roles = [...filteredRoles];
  newDisplayFilter.levels = [...filteredLevels];
  newDisplayFilter.types = [...filteredTypes];

  return newDisplayFilter;

  function getFiltered(transform: (value: LearnContent) => string[]): string[] {
    return filteredContent?.map(transform).flat(1);
  }

  function getFilteredProducts(): string[] {
    const children = getFiltered(content => content.products);
    const parents = children
      .map(childProduct => getParentProduct(childProduct, catalog?.products))
      .filter(pId => !!pId);
    return [...parents, ...children];
  }
}

function getParentProduct(product: string, products: Map<string, Product> | undefined): string {
  const productDetails = products?.get(product);
  if (productDetails) {
    const { id, parentId } = productDetails;
    if (parentId && parentId !== id) {
      return parentId;
    }
  }
  return '';
}

const getSearchTermFilteredLearnContent = (expressions: RegExp[], content: LearnContent[]): LearnContent[] => {
  return content
    .map(course => ({
      course: course,
      score: _.sumBy(
        expressions,
        singleExpression => scoreRegex(course.summary, singleExpression) + scoreRegex(course.title, singleExpression, 2)
      )
    }))
    .filter(scouredCourse => scouredCourse.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(scoredCourse => scoredCourse.course);
};

export function loadFiltersFromQueryParams(queryParams: URLSearchParams, products: Map<string, Product>): Filter {
  const filterFromQS = new Filter();
  filterFromQS.products = parseQSValues(queryParams.get('products'));
  filterFromQS.products = [...filterFromQS.products, ...addChildrenProducts(filterFromQS.products, products)];

  filterFromQS.roles = parseQSValues(queryParams.get('roles'));
  filterFromQS.levels = parseQSValues(queryParams.get('levels'));
  filterFromQS.types = parseQSValues(queryParams.get('types'));
  filterFromQS.terms = parseQSValues(queryParams.get('terms'));

  return filterFromQS;

  function parseQSValues(value: string | null, separator = ','): string[] {
    return value ? value.split(separator) : [];
  }

  function addChildrenProducts(filters: string[], products: Map<string, Product>): string[] {
    return [...products.values()]
      .filter(product => product.parentId && product.parentId !== product.id && filters.includes(product.parentId))
      .map(product => product.id);
  }
}

export function loadExpandedProductsFromQueryParams(queryParams: URLSearchParams): string[] {
  return queryParams.get('expand')?.split(',') || [];
}

export function getUpdatedURIfromSelectedFilters(
  filters: Filter,
  expandedProducts: string[],
  products: Map<string, Product> | undefined
): string {
  const newQueryParams = new URLSearchParams();

  const productUriFilters = getProductUri(products, filters.products);
  if (productUriFilters.length > 0) {
    newQueryParams.append('products', productUriFilters.toString());
  }
  if (filters.roles.length > 0) {
    newQueryParams.append('roles', filters.roles.toString());
  }
  if (filters.types.length > 0) {
    newQueryParams.append('types', filters.types.toString());
  }
  if (filters.levels.length > 0) {
    newQueryParams.append('levels', filters.levels.toString());
  }
  if (filters.terms.length > 0 && filters.terms.toString().length > 0) {
    newQueryParams.append('terms', filters.terms.toString());
  }
  if (expandedProducts.length > 0) {
    newQueryParams.append('expanded', expandedProducts.toString());
  }

  return newQueryParams.toString();

  function getProductUri(products: Map<string, Product> | undefined, filters: string[]): string[] {
    const parentFilters = filters.filter(filter => getParentProduct(filter, products) === '');
    const childrenToInclude = filters.filter(
      filter => !parentFilters.includes(filter) && !parentFilters.includes(getParentProduct(filter, products))
    );
    return [...parentFilters, ...childrenToInclude];
  }
}

export const getRegexs = (searchTerm: string): RegExp[] => {
  const expressions: RegExp[] = searchTerm
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(termPart => new RegExp(`.*${termPart}.*`, 'i'));
  expressions.push(new RegExp(`.*${searchTerm}.*`, 'i'));
  return expressions;
};

export const scoreRegex = (testPhrase: string | undefined, exp: RegExp, score = 1): number => {
  if (!testPhrase) {
    return 0;
  }
  return exp.test(testPhrase) ? score : 0;
};

// This function is not currently being used anywhere, but we may want to keep it around in case the filter functionality needs to accomodate it.

/*function removeExtrasFromSelected( type: FilterType, selectedFilters: Filter, displayFilters: Filter, products: Map<string, Product>): string[] {
  const itemsSelected = selectedFilters.get(type);
  const itemsToDisplay = displayFilters.get(type);
    
  if (itemsSelected.length===0) {
    return itemsSelected;
  }

  if (type === FilterType.products) {
    return removeExtraProductsFromSelected(itemsSelected, itemsToDisplay);
  } else {
    return itemsSelected.filter(item => itemsToDisplay.includes(item));
  }
  
  function removeExtraProductsFromSelected(productsSelected: string[], productsToDisplay: string[]) {
    const selectedInvisibleProducts = productsSelected.filter(item => !productsToDisplay.includes(item));
    const isSelectedInvisible = ({ id, parentId }: Product) =>
      selectedInvisibleProducts.includes(id) && (!parentId || !productsSelected.includes(parentId));

    const parentProductsToRemove = [...products.values()].filter(product => getParentProduct(product.id, products)==='')
                                  .filter(isSelectedInvisible)
                                  .map(product => product.id);


    const hasSelectedParent = ({ parentId }: Product) => parentId && parentProductsToRemove.includes(parentId);
    const childProductsToRemove = [...products.values()]
      .filter(product => hasSelectedParent(product) || isSelectedInvisible(product))
      .map(product => product.id);

    const productsToRemove = [...parentProductsToRemove, ...childProductsToRemove];
    return productsSelected.filter(product => !productsToRemove.includes(product));
  }
}*/
