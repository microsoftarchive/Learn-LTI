import { ModuleDto } from './Module.dto';
import { LearningPathDto } from './LearningPath.dto';
import { LevelDto } from './Level.dto';
import { RoleDto } from './Role.dto';
import { ProductDto } from './Product.dto';

export interface CatalogDto {
  modules: ModuleDto[];
  learningPaths: LearningPathDto[];
  levels: LevelDto[];
  roles: RoleDto[];
  products: ProductDto[];
}
