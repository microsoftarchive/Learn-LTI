/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import React from 'react';
import { SimpleComponentStyles, IStylesOnly, IThemeOnlyProps } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import {
  styled,
  PrimaryButton,
  MessageBarType,
  MessageBar,
  AnimationClassNames,
  IModalStyles,
  Dialog,
  Spinner,
  ITheme
} from '@fluentui/react';
import { AutohideMessageBar } from '../../Core/Components/AutohideMessageBar';
import { useStore } from '../../Stores/Core';
import { useObserver } from 'mobx-react-lite';
import { themedClassNames } from '../../Core/Utils/FluentUI';

interface PlatformControlAreaProps {
  onSaveRegirstrationClicked: () => void;
  showErrorMessage: boolean;
}

type PlatformControlAreaStylesProps = {
  theme: ITheme;
};

export type PlatformControlAreaStyles = SimpleComponentStyles<'root' | 'messageBar' | 'spinner' | 'saveButton'>;

const PlatformControlAreaInner = ({
  onSaveRegirstrationClicked,
  showErrorMessage,
  styles
}: PlatformControlAreaProps & IStylesOnly<PlatformControlAreaStyles>): JSX.Element => {
  const platformStore = useStore('platformStore');

  const classNames = themedClassNames(styles);
  return useObserver(() => (
    <div className={classNames.root}>
      {showErrorMessage && (
        <MessageBar messageBarType={MessageBarType.error} className={classNames.messageBar}>
          Please fill all required fields
        </MessageBar>
      )}
      <AutohideMessageBar
        className={classNames.messageBar}
        messageBarType={MessageBarType.error}
        showMessageBar={platformStore.saveResult === 'error'}
      >
        Failed saving registration
      </AutohideMessageBar>
      <AutohideMessageBar
        className={classNames.messageBar}
        messageBarType={MessageBarType.success}
        showMessageBar={platformStore.saveResult === 'success'}
      >
        Registration saved successfuly
      </AutohideMessageBar>
      {platformStore.isSaving && <Spinner className={classNames.spinner} />}
      <PrimaryButton onClick={onSaveRegirstrationClicked} text="Save Registration" className={classNames.saveButton} />
      <Dialog modalProps={{ isBlocking: true, styles: modalStyle }} hidden={!platformStore.isSaving}></Dialog>
    </div>
  ));
};

const PlatformControlAreaStyles = ({ theme }: IThemeOnlyProps): PlatformControlAreaStyles => ({
  root: [
    {
      padding: `${theme.spacing.l1} 0`,
      display: 'grid',
      gridColumnGap: theme.spacing.l1,
      gridTemplateColumns: '1fr 3fr 1fr',
      width: '100%'
    }
  ],
  messageBar: [
    AnimationClassNames.fadeIn200,
    {
      height: theme.spacing.l2,
      flex: 1,
      gridColumn: '2',
      overflow: 'hidden',
      selectors: {
        '& span': {
          overflow: 'hidden',
          whiteSpace: 'noWrap',
          textOverflow: 'ellipsis'
        }
      }
    }
  ],
  spinner: [
    {
      gridColumn: '2',
      marginRight: theme.spacing.l1
    }
  ],
  saveButton: [
    {
      gridColumn: '3',
      textTransform: 'uppercase',
      justifySelf: 'end'
    }
  ]
});

const modalStyle: Partial<IModalStyles> = {
  main: [
    {
      display: 'none'
    }
  ]
};

export const PlatformControlArea = styled(PlatformControlAreaInner, PlatformControlAreaStyles);
