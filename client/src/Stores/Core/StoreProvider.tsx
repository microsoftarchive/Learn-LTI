/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import React, { createContext, PropsWithChildren } from 'react';
import { RootStore } from '../Root.store';
import { useLocalStore } from 'mobx-react-lite';

// Create a store context to be used throughout this component's children

export const StoreContext = createContext<RootStore | null>(null);

// Retrieve the children prop and the rootStore prop. PropsWithChildren indicates the children prop is delcared
// as a ReactNode along with some other props (rootStore with type RootStore) and can be retrieved by deconstructing PropsWithChildren.

export const StoreProvider = ({ children, rootStore }: PropsWithChildren<{ rootStore: RootStore }>): JSX.Element => {
  const store = useLocalStore(() => ({ ...rootStore }));

  // Passing the "store" variable to this component's children
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
};
