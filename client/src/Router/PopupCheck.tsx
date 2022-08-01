/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/
import React, { PropsWithChildren, useState, useEffect } from 'react';

export const PopupCheck = ({ children }: PropsWithChildren<{}>): JSX.Element => {
  const [popupEnabled, setPopup] = useState(true);
  useEffect(() => {
    if (!popupEnabled) {
      alert('Popup is not enabled. Please enable popup');
    }
  }, [popupEnabled]);
  return <>{popupEnabled ? children : <h1> Popup is not enabled. Please enable popup for authentication. </h1>}</>;
};
