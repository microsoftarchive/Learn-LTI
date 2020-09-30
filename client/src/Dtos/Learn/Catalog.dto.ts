/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { ModuleDto } from './Module.dto';
import { LearningPathDto } from './LearningPath.dto';
import { LevelDto } from './Level.dto';
import { RoleDto } from './Role.dto';
import { ProductDto } from './Product.dto';

export interface CatalogDto {
  modules: ModuleDto[];
  learningPaths: LearningPathDto[];
  levels: LevelDto[];
  roles: RoleDto[];
  products: ProductDto[];
}
