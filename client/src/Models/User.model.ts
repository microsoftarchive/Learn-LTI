/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { UserDto } from '../Dtos/User.dto';
import { UserRole } from './UserRole.model';

export type User = Omit<UserDto, 'role' | 'familyName' | 'givenName'> & {
  role?: UserRole;
  roleDisplayName: string;
  displayName: string;
};
