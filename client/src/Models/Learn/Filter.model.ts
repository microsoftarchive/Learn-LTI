/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

interface FilterModel {
  products?: string[];
  roles?: string[];
  types?: string[];
  levels?: string[];
  terms?: string[];
}

export class Filter {
  products: string[];
  roles: string[];
  types: string[];
  levels: string[];
  terms: string[];

  constructor({ products = [], roles = [], types = [], levels = [], terms = [] }: FilterModel) {
    this.products = products;
    this.roles = roles;
    this.types = types;
    this.levels = levels;
    this.terms = terms;
  }
}
