/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import React, { createContext, PropsWithChildren } from 'react';
import { RootStore } from '../Root.store';
import { useLocalStore } from 'mobx-react-lite';

export const StoreContext = createContext<RootStore | null>(null);

export const StoreProvider = ({ children, rootStore }: PropsWithChildren<{ rootStore: RootStore }>) => {
  const store = useLocalStore(() => ({ ...rootStore }));

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
};
