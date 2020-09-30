import { Product, LearnType, Level, Role } from '../../Models/Learn';
import { FilterType } from '../../Models/Learn/FilterType.model';
import { FormEvent } from 'react';
import { FilterComponentStyles } from './MicrosoftLearnFilterComponentUtils';

export type LearnTypeName = 'Learning Path' | 'Module';

export type LearnTypeFilterOption = {
  id: LearnType;
  name: LearnTypeName;
};

export type FilterOption = Product | Role | Level | LearnTypeFilterOption;

export type FilterComponentProps = {
  styles: FilterComponentStyles;
  filterType: FilterType;
  filterName: string;
  filterOption: Map<FilterOption, FilterOption[]> | null;
  mainItemClickHandler:
    | ((event?: FormEvent<HTMLElement | HTMLInputElement> | undefined, checked?: boolean | undefined) => void)
    | undefined;
  subItemClickHandler?:
    | ((event?: FormEvent<HTMLElement | HTMLInputElement> | undefined, checked?: boolean | undefined) => void)
    | undefined;
  search: boolean;
};

export type FilterItemProps = {
  styles: FilterComponentStyles;
  filterType: FilterType;
  mainItem: FilterOption;
  subItems: FilterOption[] | undefined;
  mainItemClickHandler:
    | ((event?: FormEvent<HTMLElement | HTMLInputElement> | undefined, checked?: boolean | undefined) => void)
    | undefined; // ((event: React.MouseEvent<HTMLInputElement, MouseEvent>) => void) | undefined,
  subItemClickHandler?:
    | ((event?: FormEvent<HTMLElement | HTMLInputElement> | undefined, checked?: boolean | undefined) => void)
    | undefined;
};
