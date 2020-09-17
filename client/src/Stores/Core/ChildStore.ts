/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { RootStore } from '../Root.store';

export abstract class ChildStore {
  private _root: RootStore | null = null;

  protected get root(): RootStore {
    return this._root as RootStore;
  }

  setRootStore = (root: RootStore): void => {
    this._root = root;
  };

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  initialize(): void {}
}
