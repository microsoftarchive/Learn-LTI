/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ProductChildDto } from './ProductChild.dto';

export interface ProductDto {
  id: string;
  name: string;
  children: ProductChildDto[];
}
