/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ModuleDto } from '../../Dtos/Learn';
import { LearnType } from '.';

export type Module = Omit<ModuleDto, 'type'> & { type: LearnType };
