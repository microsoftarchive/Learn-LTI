/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import React, { PropsWithChildren, useState, useEffect } from 'react';
import axios from 'axios';
import { AppAuthConfig } from './AppAuthConfig';

export const AxiosBasicAuthInitializer = ({ children }: PropsWithChildren<{}>): JSX.Element => {
  const [isTokenLoaded, setIsTokenLoaded] = useState(false);

  useEffect(() => {
    AppAuthConfig.getAccessToken()
      .then(tokenObj => (axios.defaults.headers.common = { Authorization: `bearer ${tokenObj.accessToken}` }))
      .then(_ => setIsTokenLoaded(true));
    axios.defaults.validateStatus = () => true;
  }, []);

  return <>{isTokenLoaded ? children : null}</>;
};
