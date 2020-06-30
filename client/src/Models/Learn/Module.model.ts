import { ModuleDto } from '../../Dtos/Learn';
import { LearnType } from '.';

export type Module = Omit<ModuleDto, 'type'> & { type: LearnType };
