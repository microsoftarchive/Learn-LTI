/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ModuleDto } from './Module.dto';

export interface LearningPathDto extends ModuleDto {
  modules: string[];
}
