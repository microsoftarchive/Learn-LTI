/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { PlatformPersonalizationDto } from './PlatformPersonalization.dto';

export interface AssignmentDto {
  id: string;
  deadline: Date | null;
  courseName: string;
  name: string;
  description: string;
  publishStatus: 'NotPublished' | 'Published';
  platformPersonalization: PlatformPersonalizationDto;
}
