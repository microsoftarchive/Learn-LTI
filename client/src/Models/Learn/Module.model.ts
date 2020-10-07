/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { ModuleDto } from '../../Dtos/Learn';
import { LearnType } from '.';

export type Module = Omit<ModuleDto, 'type'> & { type: LearnType };
