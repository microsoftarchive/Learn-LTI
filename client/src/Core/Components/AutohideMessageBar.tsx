/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import React, { PropsWithChildren, useEffect, useState, useRef } from 'react';
import { SimpleComponentStyles, IStylesOnly } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { MessageBar, IMessageBarProps } from '@fluentui/react';

export const MESSAGE_BAR_AUTO_HIDE_DURATION = 5000;

interface AutohideMessageBarProps {
  showMessageBar: boolean;
}

type AutohideMessageBarStyles = SimpleComponentStyles<'root'>;

export const AutohideMessageBar = ({
  showMessageBar,
  ...rest
}: PropsWithChildren<AutohideMessageBarProps> &
  IStylesOnly<AutohideMessageBarStyles> &
  IMessageBarProps): JSX.Element | null => {
  const [isShown, setIsShown] = useState<boolean>(false);
  const timer = useRef<NodeJS.Timer>();

  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    []
  );

  useEffect(() => {
    if (showMessageBar) {
      setIsShown(true);
      timer.current = setTimeout(() => {
        setIsShown(false);
      }, MESSAGE_BAR_AUTO_HIDE_DURATION);
    }
  }, [showMessageBar]);

  if (isShown) {
    return <MessageBar {...rest} />;
  }
  return null;
};
