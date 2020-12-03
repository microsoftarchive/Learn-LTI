/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { PlatformPersonalizationDto } from './PlatformPersonalization.dto';
import { PublishStatusDto } from './PublishStatus.dto';

export interface AssignmentDto {
  id: string;
  deadline: Date;
  courseName: string;
  name: string;
  description: string;
  publishStatus: PublishStatusDto;
  platformPersonalization: PlatformPersonalizationDto;
}
