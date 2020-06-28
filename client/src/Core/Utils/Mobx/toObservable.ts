import { Observable, from } from 'rxjs';
import { toStream } from 'mobx-utils';

export function toObservable<T>(expression: () => T, fireImmediately?: boolean): Observable<T> {
  // The following line is broken in strict mode due to mobx-utils toStream and rxjs from combination.
  // @ts-ignore
  return from(toStream(expression, fireImmediately));
}
