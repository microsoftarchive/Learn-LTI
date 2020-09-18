/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { ModuleDto } from './Module.dto';

export interface LearningPathDto extends ModuleDto {
  modules: string[];
}
