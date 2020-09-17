/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Level } from './Level.model';
import { Role } from './Role.model';
import { LearnContent } from './LearnContent.model';
import { Product } from './Product.model';

export interface Catalog {
  contents: Map<string, LearnContent>;
  levels: Map<string, Level>;
  roles: Map<string, Role>;
  products: Map<string, Product>;
}
