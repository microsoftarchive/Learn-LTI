/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

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

interface FilterCommonProps {
  styles: FilterComponentStyles;
  filterType: FilterType;
  mainItemClickHandler:
    | ((event?: FormEvent<HTMLElement | HTMLInputElement> | undefined, checked?: boolean | undefined) => void)
    | undefined;
  subItemClickHandler?:
    | ((event?: FormEvent<HTMLElement | HTMLInputElement> | undefined, checked?: boolean | undefined) => void)
    | undefined;
}

export interface FilterComponentProps extends FilterCommonProps {
  filterName: string;
  filterOption: Map<FilterOption, FilterOption[]> | null;
  search: boolean;
};

export interface FilterItemProps extends FilterCommonProps {
  mainItem: FilterOption;
  subItems: FilterOption[] | undefined;
};