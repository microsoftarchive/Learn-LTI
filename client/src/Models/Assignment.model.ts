/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AssignmentDto } from '../Dtos/Assignment.dto';
import { PlatformPersonalization } from './PlatformPersonalization.model';

export type Assignment = Omit<AssignmentDto, 'platformPersonalization'> & {
  platformPersonalization: PlatformPersonalization;
};
