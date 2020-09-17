/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { UserRoleDto } from './UserRole.dto';

export interface UserDto {
  familyName: string;
  givenName: string;
  email: string;
  role: UserRoleDto;
}
