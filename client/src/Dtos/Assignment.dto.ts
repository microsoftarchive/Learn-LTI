/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { PlatformPersonalizationDto } from './PlatformPersonalization.dto';

export interface AssignmentDto {
  id: string;
  deadline: Date;
  courseName: string;
  name: string;
  description: string;
  publishStatus: 'NotPublished' | 'Published';
  platformPersonalization: PlatformPersonalizationDto;
}
