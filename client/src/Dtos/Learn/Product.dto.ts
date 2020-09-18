/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { ProductChildDto } from './ProductChild.dto';

export interface ProductDto {
  id: string;
  name: string;
  children: ProductChildDto[];
}
