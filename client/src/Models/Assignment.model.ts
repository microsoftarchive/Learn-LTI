import { AssignmentDto } from '../Dtos/Assignment.dto';
import { PlatformPersonalization } from './PlatformPersonalization.model';

export type Assignment = Omit<AssignmentDto, 'platformPersonalization'> & {
  platformPersonalization: PlatformPersonalization;
};
