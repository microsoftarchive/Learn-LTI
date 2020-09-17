/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ProductDto } from '../../Dtos/Learn';

export type Product = Omit<ProductDto, 'children'> & {
  parentId: string | null;
};
