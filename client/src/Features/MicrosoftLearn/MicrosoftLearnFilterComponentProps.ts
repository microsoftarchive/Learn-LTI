import { Product, Role, Level, LearnType } from '../../Models/Learn';
import { FilterType } from '../../Models/Learn/FilterType.model';
import { RoleDto } from '../../Dtos/Learn/Role.dto';


export type LearnTypeName = 'Learning Path' | 'Module'

export type LearnTypeFilterOption = {
    id: LearnType,
    name: LearnTypeName

}
export type FilterOption = Product | Role | Level | LearnTypeFilterOption | Pick<RoleDto, "id" | "name"> | undefined

export type FilterComponentProps = {
    filterType: FilterType,
    filterName: string,
    filterOption: Map<FilterOption, FilterOption[]> | null,
    mainItemClickHandler: ((event: React.MouseEvent<HTMLInputElement, MouseEvent>) => void) | undefined,
    subItemClickHandler: ((event: React.MouseEvent<HTMLInputElement, MouseEvent>) => void) | undefined,
    search: boolean

}

export type FilterItemProps = {
    filterType: FilterType,
    mainItem: FilterOption,
    subItems: FilterOption[] | undefined,
    mainItemClickHandler: ((event: React.MouseEvent<HTMLInputElement, MouseEvent>) => void) | undefined,
    subItemClickHandler: ((event: React.MouseEvent<HTMLInputElement, MouseEvent>) => void) | undefined
}
