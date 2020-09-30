import { ModuleDto } from './Module.dto';

export interface LearningPathDto extends ModuleDto {
  modules: string[];
}
