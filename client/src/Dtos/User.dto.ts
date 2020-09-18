/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { UserRoleDto } from './UserRole.dto';

export interface UserDto {
  familyName: string;
  givenName: string;
  email: string;
  role: UserRoleDto;
}
