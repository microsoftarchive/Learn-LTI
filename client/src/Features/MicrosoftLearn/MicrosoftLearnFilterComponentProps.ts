/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { Product, LearnType, Level, Role } from '../../Models/Learn';
import { FilterType } from '../../Models/Learn/FilterType.model';
import { FormEvent } from 'react';
import { FilterComponentStyles } from './MicrosoftLearnFilterComponentUtils';

export type LearnTypeName = 'Learning Path' | 'Module';

// The following type has been declared separately because the currently, the LearnType.model stores a simple string.
// TODO: Make LearnType.model to be in the following object format, and change all its references accordingly.
export type LearnTypeFilterOption = {
  id: LearnType;
  name: LearnTypeName;
};

export type FilterOption = Product | Role | Level | LearnTypeFilterOption;
type FilterItemClickHandler = ((event?: FormEvent<HTMLElement | HTMLInputElement> | undefined, checked?: boolean | undefined) => void);

interface FilterCommonProps {
  styles: FilterComponentStyles;
  filterType: FilterType;
  mainItemClickHandler: FilterItemClickHandler | undefined;
  subItemClickHandler?: FilterItemClickHandler | undefined;
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