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
