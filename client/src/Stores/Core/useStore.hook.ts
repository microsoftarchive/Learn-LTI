import { RootStore } from '../Root.store';
import { useContext } from 'react';
import { StoreContext, ChildStore } from '.';

export const useRootStore = (): RootStore => {
  const rootStore: RootStore | null = useContext(StoreContext);
  if (rootStore === null) {
    throw new Error("StoreContext wasn't properly initialized.");
  } else {
    return rootStore;
  }
};

type ChildStoresInRoot = AllowedNames<RootStore, ChildStore>;

export const useStore = <K extends ChildStoresInRoot>(storeName: K): RootStore[K] => {
  const rootStore: RootStore = useRootStore();

  return rootStore[storeName];
};
