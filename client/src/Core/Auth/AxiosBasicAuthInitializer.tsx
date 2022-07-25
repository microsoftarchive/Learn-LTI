/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import React, { PropsWithChildren, useState, useEffect } from 'react';
import axios from 'axios';
import { AppAuthConfig } from './AppAuthConfig';

export const AxiosBasicAuthInitializer = ({ children }: PropsWithChildren<{}>): JSX.Element => {
  const [isTokenLoaded, setIsTokenLoaded] = useState(false);

  //Called everytime time the LTI app is accessed to authenticate the user before allowing access.
  useEffect(() => {
    AppAuthConfig.getAccessToken()
      .then(tokenObj => (axios.defaults.headers.common = { Authorization: `bearer ${tokenObj.accessToken}` }))
      .then(_ => setIsTokenLoaded(true));
    axios.defaults.validateStatus = () => true;
  }, []);

  //Check if user has successfully been authenticated and load children(Children are basically anything that
  //is between the open and closing tag of this <AxiosBasicAuthInitialer> component), otherwise return null.
  return <>{isTokenLoaded ? children : null}</>;
};
