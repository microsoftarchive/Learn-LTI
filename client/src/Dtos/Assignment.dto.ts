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
