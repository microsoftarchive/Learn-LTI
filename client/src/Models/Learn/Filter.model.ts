/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { FilterType } from './FilterType.model';

export class Filter {
  products: string[];
  roles: string[];
  types: string[];
  levels: string[];
  terms: string[];

  constructor() {
    this.products = [];
    this.roles = [];
    this.types = [];
    this.levels = [];
    this.terms = [];
  }

  get(type: FilterType): string[] {
    return this[type];
  }

  set(type: FilterType, newValue: string[]): void {
    this[type] = newValue;
  }
}
