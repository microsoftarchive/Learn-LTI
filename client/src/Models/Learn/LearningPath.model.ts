/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { LearningPathDto } from '../../Dtos/Learn';
import { LearnType } from './LearnType.model';

export type LearningPath = Omit<LearningPathDto, 'type'> & { type: LearnType };
