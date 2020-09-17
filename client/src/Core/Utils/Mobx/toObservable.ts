/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Observable, from } from 'rxjs';
import { toStream } from 'mobx-utils';

export function toObservable<T>(expression: () => T, fireImmediately?: boolean): Observable<T> {
  // The following line is broken in strict mode due to mobx-utils toStream and rxjs from combination.
  // @ts-ignore
  return from(toStream(expression, fireImmediately));
}
