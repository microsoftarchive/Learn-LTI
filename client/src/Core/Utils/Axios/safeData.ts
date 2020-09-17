/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AxiosResponse } from 'axios';
import { ServiceError } from './ServiceError';

const errorNumberToEnumMap: Map<number, ServiceError> = new Map<number, ServiceError>([
  [500, 'internal error'],
  [401, 'unauthorized'],
  [404, 'not found']
]);

export type WithError<T> = T & { error?: ServiceError };

export const safeData = <T>(response: AxiosResponse<T>): WithError<T> => {
  return response.status < 200 || response.status >= 300
    ? { ...response.data, error: errorNumberToEnumMap.get(response.status) || 'other' }
    : response.data;
};

export const getServiceError = <T>(response: AxiosResponse<T>): ServiceError | null => {
  const data = safeData(response);
  return data.error ? data.error : null;
};
