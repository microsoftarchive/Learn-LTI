/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { Product, Catalog, LearnType } from '../../Models/Learn';
import { FilterType } from '../../Models/Learn/FilterType.model';
import { LearnTypeFilterOption, FilterOption } from './MicrosoftLearnFilterComponentProps';
import _ from 'lodash';
import { getParentProduct, scoreRegex } from './MicrosoftLearnFilterCore';
import { Filter } from '../../Models/Learn/Filter.model';
import { toMap } from '../../Core/Utils/Typescript/ToMap';

export const TYPE_MAP = new Map<LearnType, LearnTypeFilterOption>([
  ['module', { id: 'module', name: 'Module' }],
  ['learningPath', { id: 'learningPath', name: 'Learning Path' }]
]);

const SortByFilterNameAscComparer = (a: FilterOption, b: FilterOption) => {
  if (a && b) {
    return a.name.localeCompare(b.name);
  } else if (a) {
    return 1;
  }
  return -1;
};

const createOptionsMapFromKeys = (keys: FilterOption[]) => {
  const valueTransformer = (item: FilterOption) => [];
  const keySelector = (item: FilterOption) => item;   
  return toMap(keys, keySelector, valueTransformer); 
};

export const getProductsToDisplay = (productId: string[] | undefined, productMap: Map<string, Product> | undefined) => {
  let products: Product[] = [];
  let productParentChildMap = new Map<Product, Product[]>();

  if (productMap != null) {
    products = [...productMap.values()].filter(product => productId?.includes(product.id));
    const getParentProductMapping = getParentProduct(productMap);
    const parentProducts = products
      .filter(item => getParentProductMapping(item.id) === '')
      .sort(SortByFilterNameAscComparer);
    parentProducts.forEach(parent => {
      let children = products.filter(
        product => product?.parentId && product.parentId === parent?.id && product.id !== parent.id
      );
      productParentChildMap.set(parent, children.sort(SortByFilterNameAscComparer));
    });
  }
  return productParentChildMap;
};

export function getFilterItemsToDisplay<T extends FilterOption>(
  ids: string[] | undefined,
  map: Map<string, T> | undefined
) {
  if (map != null) {
    let sortedItems = ids?.map(id => map.get(id)!!).sort(SortByFilterNameAscComparer);
    return createOptionsMapFromKeys(sortedItems || []);
  }
  return new Map<T, T[]>();
}

export type FilterTag = { id: string; name: string; type: FilterType };

export const getDisplayFilterTags = (
  displayFilters: Filter,
  selectedFilters: Filter,
  productsMap: Map<string, Product>,
  learnCatalog: Catalog | null
) => {
  const getIntersection = (type: FilterType) => {
    let intersect = displayFilters[type].filter(item => selectedFilters[type]?.includes(item));
    if (type === FilterType.products) {
      intersect.map(productItem => productsMap.get(productItem)).filter(productItem => productItem?.parentId);

      let getParentProductMapping = getParentProduct(productsMap);
      let parentTags = intersect.filter(item => getParentProductMapping(item) === '');
      let childTags = intersect.filter(item => !parentTags.includes(getParentProductMapping(item)));
      return [...parentTags, ...childTags];
    }
    return intersect;
  };

  const getTags = (_map: Map<string, FilterOption> | undefined, _type: FilterType) => {
    let _tags: FilterTag[] = [];
    let _filters = getIntersection(_type);
    if (_map?.values()) {
      _tags = [..._map.values()]
        .filter(item => _filters?.includes(item.id))
        .map(item => ({ id: item.id, name: item.name, type: _type }));
    }
    return _tags;
  };

  let productTags: FilterTag[] = getTags(learnCatalog?.products, FilterType.products);
  let roleTags: FilterTag[] = getTags(learnCatalog?.roles, FilterType.roles);
  let levelTags: FilterTag[] = getTags(learnCatalog?.levels, FilterType.levels);
  let typeTags: FilterTag[] = getTags(TYPE_MAP, FilterType.types);

  return [...productTags, ...roleTags, ...levelTags, ...typeTags];
};

export const getDisplayFromSearch = (expressions: RegExp[], currentDisplay: Map<FilterOption, FilterOption[]>) => {
  let filteredDisplay: Map<FilterOption, FilterOption[]> = new Map<FilterOption, FilterOption[]>();
  [...currentDisplay.keys()].forEach(key => {
    let children = currentDisplay.get(key);
    let filteredByRegEx: FilterOption[] = [];
    if (children && children.length > 0) {
      filteredByRegEx = children
        .map(chlid => ({
          item: chlid,
          score: _.sumBy(expressions, singleExpression => scoreRegex(chlid?.name, singleExpression))
        }))
        .filter(chlid => chlid.score > 0)
        .map(chlid => chlid.item);
      if (filteredByRegEx?.length && filteredByRegEx.length > 0) {
        filteredDisplay.set(key, filteredByRegEx);
      }
    } else {
      filteredByRegEx = [
        {
          item: key,
          score: _.sumBy(expressions, singleExpression => scoreRegex(key?.name, singleExpression))
        }
      ]
        .filter(element => element.score > 0)
        .map(element => element.item);
      if (filteredByRegEx.length > 0) {
        filteredDisplay.set(key, []);
      }
    }
  });
  return filteredDisplay;
};
