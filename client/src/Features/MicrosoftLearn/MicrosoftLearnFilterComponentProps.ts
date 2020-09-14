import { Product, LearnType } from '../../Models/Learn';
import { FilterType } from '../../Models/Learn/FilterType.model';
import { RoleDto } from '../../Dtos/Learn/Role.dto';
import { LevelDto } from '../../Dtos/Learn';
import { FormEvent } from 'react';


export type LearnTypeName = 'Learning Path' | 'Module'

export type LearnTypeFilterOption = {
    id: LearnType,
    name: LearnTypeName

}
export type FilterOption = Product | Pick<LevelDto, "id" | "name">  | LearnTypeFilterOption | Pick<RoleDto, "id" | "name"> | undefined

export type FilterComponentProps = {
    filterType: FilterType,
    filterName: string,
    filterOption: Map<FilterOption, FilterOption[]> | null,
    mainItemClickHandler: ((event?: FormEvent<HTMLElement | HTMLInputElement> | undefined, checked?: boolean | undefined) => void) | undefined,
    // ((event: React.MouseEvent<HTMLInputElement, MouseEvent>) => void) | undefined,
    subItemClickHandler: ((event?: FormEvent<HTMLElement | HTMLInputElement> | undefined, checked?: boolean | undefined) => void) | undefined,
    search: boolean

}

export type FilterItemProps = {
    filterType: FilterType,
    mainItem: FilterOption,
    subItems: FilterOption[] | undefined,
    mainItemClickHandler:  ((event?: FormEvent<HTMLElement | HTMLInputElement> | undefined, checked?: boolean | undefined) => void) | undefined,   // ((event: React.MouseEvent<HTMLInputElement, MouseEvent>) => void) | undefined,
    subItemClickHandler: ((event?: FormEvent<HTMLElement | HTMLInputElement> | undefined, checked?: boolean | undefined) => void) | undefined  
}
