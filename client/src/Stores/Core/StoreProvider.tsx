import React, { createContext, PropsWithChildren } from 'react';
import { RootStore } from '../Root.store';
import { useLocalStore } from 'mobx-react-lite';

export const StoreContext = createContext<RootStore | null>(null);

export const StoreProvider = ({ children, rootStore }: PropsWithChildren<{ rootStore: RootStore }>) => {
  const store = useLocalStore(() => ({ ...rootStore }));

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
};
