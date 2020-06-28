import { UserRoleDto } from './UserRole.dto';

export interface UserDto {
  familyName: string;
  givenName: string;
  email: string;
  role: UserRoleDto;
}
