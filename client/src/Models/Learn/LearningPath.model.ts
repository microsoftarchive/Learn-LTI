/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { LearningPathDto } from '../../Dtos/Learn';
import { LearnType } from './LearnType.model';

export type LearningPath = Omit<LearningPathDto, 'type'> & { type: LearnType };
