/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { ProductDto } from '../../Dtos/Learn';

export type Product = Omit<ProductDto, 'children'> & {
  parentId: string | null;
};
