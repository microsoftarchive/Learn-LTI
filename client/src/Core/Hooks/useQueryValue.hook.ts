/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { useLocation } from 'react-router-dom';

export const useQueryValue = (paramId: string): string | null => {
  const queryParams = new URLSearchParams(useLocation().search);
  return queryParams.get(paramId);
};
