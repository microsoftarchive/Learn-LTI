/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { LearnTypeDto } from './LearnType.dto';

export interface ModuleDto {
  summary: string;
  levels: string[];
  roles: string[];
  products: string[];
  uid: string;
  type: LearnTypeDto;
  title: string;
  duration_in_minutes: number;
  icon_url: string;
  locale: string;
  last_modified: Date;
  url: string;
  number_of_children: number;
}
