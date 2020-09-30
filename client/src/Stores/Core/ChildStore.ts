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
