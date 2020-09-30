import { UserDto } from '../Dtos/User.dto';
import { UserRole } from './UserRole.model';

export type User = Omit<UserDto, 'role' | 'familyName' | 'givenName'> & {
  role?: UserRole;
  roleDisplayName: string;
  displayName: string;
};
