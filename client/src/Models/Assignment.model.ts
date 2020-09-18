/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { AssignmentDto } from '../Dtos/Assignment.dto';
import { PlatformPersonalization } from './PlatformPersonalization.model';

export type Assignment = Omit<AssignmentDto, 'platformPersonalization'> & {
  platformPersonalization: PlatformPersonalization;
};
