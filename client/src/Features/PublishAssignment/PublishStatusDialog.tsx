/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import React, { useState, useEffect } from 'react';
import { IStylesOnly } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import {
  Dialog,
  DialogFooter,
  PrimaryButton,
  DefaultButton,
  IModalProps,
  IModalStyles,
  IDialogStyles,
  Icon
} from '@fluentui/react';
import { DIALOG_MIN_WIDTH, commonDialogContentProps } from '../../Core/Components/Common/Dialog/EdnaDialogStyles';
import { useStore } from '../../Stores/Core';
import { useObserver } from 'mobx-react-lite';
import { FontSizes } from '@uifabric/fluent-theme';

interface PublishStatusDialogProps {
  onApprove: () => void;
  onDismiss: () => void;
  isOpen: boolean;
  title: string;
  subText: string;
  approveButtonText: string;
  warningText: string | null;
}

export const PublishStatusDialog = ({
  onApprove,
  onDismiss,
  isOpen,
  title,
  subText,
  approveButtonText,
  warningText,
  styles
}: PublishStatusDialogProps & IStylesOnly<Partial<IDialogStyles>>): JSX.Element => {
  const [isDialogWindowVisible, setIsDialogWindowVisible] = useState<boolean>(true);

  const assignmentStore = useStore('assignmentStore');

  useEffect(() => {
    setIsDialogWindowVisible(isOpen);
  }, [isOpen]);

  const onClickApprove = (): void => {
    setIsDialogWindowVisible(false);
    onApprove();
  };

  return useObserver(() => {
    const modalProps: IModalProps = {
      isBlocking: !!assignmentStore.isChangingPublishState,
      styles: modalStyle(isDialogWindowVisible)
    };

    return (
      <Dialog
        styles={styles}
        modalProps={modalProps}
        hidden={!isOpen}
        onDismiss={onDismiss}
        dialogContentProps={{ ...commonDialogContentProps, title }}
        minWidth={DIALOG_MIN_WIDTH}
        subText={subText}
      >

        {warningText && 
          <div className='warning'>
            <Icon className='warningIcon' iconName='WarningSolid'/>
            <span className='warningText'> {warningText} </span>
          </div>
        } 
        <DialogFooter>
          <PrimaryButton onClick={onClickApprove} text={approveButtonText} />
          <DefaultButton onClick={onDismiss} text="Cancel" />
        </DialogFooter>
      </Dialog>
    );
  });
};

const modalStyle = (isDialogWindowVisible: boolean): Partial<IModalStyles> => ({
  main: [
    {
      display: isDialogWindowVisible ? 'flex' : 'none',
      selectors: {
        '.warning':{
          display: 'flex', 
          flexDirection: 'row',
          selectors: {
            '.warningIcon': {
              fontSize: FontSizes.size32,
              color: '#FFC100',
              margin: 'auto'
            },
            '.warningText': {
              fontSize: FontSizes.size12,
              paddingLeft: '8px'
            }
          }
        }    
      }
    }
  ]
});
