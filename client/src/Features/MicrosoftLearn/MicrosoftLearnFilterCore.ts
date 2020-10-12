/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import _ from 'lodash';
import { Catalog, LearnContent, Product } from '../../Models/Learn';
import { Filter } from '../../Models/Learn/Filter.model';
import { FilterType } from '../../Models/Learn/FilterType.model';

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

export function getFiltersToDisplay(catalog: Catalog | null, filteredContent: LearnContent[]): Filter {
  const filteredProducts = new Set(getFilteredProducts());
  const filteredRoles = new Set(getFiltered(content => content.roles));
  const filteredTypes = new Set(getFiltered(content => [content.type]));
  const filteredLevels = new Set(getFiltered(content => content.levels));

  return new Filter({
    products: [...filteredProducts],
    roles: [...filteredRoles],
    levels: [...filteredLevels],
    types: [...filteredTypes]
  });

  function getFiltered(transform: (value: LearnContent) => string[]): string[] {
    return filteredContent?.map(transform).flat(1);
  }

  function getFilteredProducts(): string[] {
    const children = getFiltered(content => content.products);
    const parents = children.map(getParentProduct(catalog?.products)).filter(pId => !!pId);
    return [...parents, ...children];
  }
}

export function getParentProduct(products: Map<string, Product> | undefined) {
  return function getProduct(product: string): string {
    const productDetails = products?.get(product);
    if (productDetails) {
      const { id, parentId } = productDetails;
      if (parentId && parentId !== id) {
        return parentId;
      }
    }
    return '';
  };
}

function getSearchTermFilteredLearnContent(expressions: RegExp[], content: LearnContent[]): LearnContent[] {
  type ScoredCourse = { course: LearnContent; score: number };
  return content
    .map(createScoredCourseFromCourse)
    .filter(scouredCourse => scouredCourse.score > 0)
    .sort(sortByScoreAsc)
    .map(scoredCourse => scoredCourse.course);

  function createScoredCourseFromCourse(course: LearnContent): ScoredCourse {
    return { course: course, score: _.sumBy(expressions, computeScoreFor(course)) };
  }

  function computeScoreFor(course: LearnContent) {
    return function scoreForTerm(term: RegExp) {
      return scoreRegex(course.summary, term) + scoreRegex(course.title, term, 2);
    };
  }

  function sortByScoreAsc(course1: ScoredCourse, course2: ScoredCourse): number {
    return course1.score - course2.score;
  }
}

function parseAsArray(value: string | null): string[] {
  return value ? value.split(',') : [];
}

export function loadFiltersFromQueryParams(queryParams: URLSearchParams, products: Map<string, Product>): Filter {
  return new Filter({
    products: parseProductsFromParams(queryParams),
    roles: parseAsArray(queryParams.get(FilterType.roles)),
    levels: parseAsArray(queryParams.get(FilterType.levels)),
    types: parseAsArray(queryParams.get(FilterType.types)),
    terms: parseAsArray(queryParams.get(FilterType.terms))
  });

  function parseProductsFromParams(queryParams: URLSearchParams): string[] {
    const parents = parseAsArray(queryParams.get(FilterType.products));
    return [...parents, ...addChildrenProducts(parents, products)];
  }

  function addChildrenProducts(selectedProducts: string[], products: Map<string, Product>): string[] {
    return [...products.values()]
      .filter(({ parentId, id }) => parentId && parentId !== id && selectedProducts.includes(parentId))
      .map(product => product.id);
  }
}

export function loadExpandedProductsFromQueryParams(queryParams: URLSearchParams): string[] {
  return parseAsArray(queryParams.get('expand'));
}

export function getUpdatedURIFromSelectedFilters(
  filters: Filter,
  expandedProducts: string[],
  products: Map<string, Product> | undefined
): string {
  const newQueryParams = new URLSearchParams();
  addFilteredProductsToQueryParam(newQueryParams);
  addFiltersToQueryParam(FilterType.roles, newQueryParams);
  addFiltersToQueryParam(FilterType.types, newQueryParams);
  addFiltersToQueryParam(FilterType.levels, newQueryParams);
  addFiltersToQueryParam(FilterType.terms, newQueryParams);
  addExpandedProductsToQueryParam(newQueryParams);
  return newQueryParams.toString();

  function addFilteredProductsToQueryParam(queryParams: URLSearchParams): void {
    const allSelected = getAllProducts(products, filters[FilterType.products]);
    if (allSelected.length > 0) {
      queryParams.append(FilterType.products, allSelected.toString());
    }
  }

  function addFiltersToQueryParam(filterName: FilterType, queryParams: URLSearchParams): void {
    if (filters[filterName].filter(item => item !== '').length > 0) {
      queryParams.append(filterName, filters[filterName].filter(item => item !== '').toString());
    }
  }

  function addExpandedProductsToQueryParam(queryParams: URLSearchParams): void {
    if (expandedProducts.length > 0) {
      queryParams.append('expanded', expandedProducts.toString());
    }
  }

  function getAllProducts(products: Map<string, Product> | undefined, filteredProducts: string[]): string[] {
    const getParent = getParentProduct(products);
    const parents = filteredProducts.filter(product => getParent(product) === '');
    const childrenToInclude = filteredProducts.filter(
      product => !parents.includes(product) && !parents.includes(getParent(product))
    );
    return [...parents, ...childrenToInclude];
  }
}

export const getRegexs = (searchTerm: string): RegExp[] => {
  searchTerm = searchTerm.replace(/([.?*+^$[\]\\(){}|-])/g, '');
  if (searchTerm === '') {
    return [new RegExp(`.*`)];
  }
  const wordExpressions: RegExp[] = searchTerm
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .flatMap(termPart => termPart.match(/.{1,20000}/g)) // using 20000 as the max length of a regexp
    .map(termPart => new RegExp(`.*${termPart}.*`, 'i'));

  const fullTermExpressions: RegExp[] =
    searchTerm.match(/.{1,20000}/g)?.map(termPart => new RegExp(`.*${termPart}.*`, 'i')) || [];
  return [...wordExpressions, ...fullTermExpressions];
};

export function scoreRegex(testPhrase: string | undefined, exp: RegExp, score = 1): number {
  return testPhrase && exp.test(testPhrase) ? score : 0;
}

/*
// The below function is not currently being used anywhere, but we may want to keep it around in case the filter functionality needs to accommodate it.
function removeExtrasFromSelected(
  type: FilterType,
  selectedFilters: Filter,
  displayFilters: Filter,
  products: Map<string, Product>
): string[] {
  const itemsSelected = selectedFilters.get(type);
  const itemsToDisplay = displayFilters.get(type);

  if (itemsSelected.length === 0) {
    return itemsSelected;
  }

  if (type === FilterType.products) {
    return removeExtraProductsFromSelected(itemsSelected, itemsToDisplay);
  } else {
    return itemsSelected.filter(item => itemsToDisplay.includes(item));
  }

  function removeExtraProductsFromSelected(productsSelected: string[], productsToDisplay: string[]): string[] {
    const selectedInvisibleProducts = productsSelected.filter(item => !productsToDisplay.includes(item));
    const isSelectedInvisible = ({ id, parentId }: Product): boolean =>
      selectedInvisibleProducts.includes(id) && (!parentId || !productsSelected.includes(parentId));

    const parentProductsToRemove = [...products.values()]
      .filter(product => getParentProduct(products)(product.id) === '')
      .filter(isSelectedInvisible)
      .map(product => product.id);

    const hasSelectedParent = ({ parentId }: Product): boolean =>
      !!parentId && parentProductsToRemove.includes(parentId);
    const childProductsToRemove = [...products.values()]
      .filter(product => hasSelectedParent(product) || isSelectedInvisible(product))
      .map(product => product.id);

    const productsToRemove = [...parentProductsToRemove, ...childProductsToRemove];
    return productsSelected.filter(product => !productsToRemove.includes(product));
  }
}
*/
