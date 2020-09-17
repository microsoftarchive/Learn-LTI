/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import React, { useState } from 'react';
import { IThemeOnlyProps } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import {
  styled,
  ActionButton,
  IButtonStyles,
  Dialog,
  DialogFooter,
  PrimaryButton,
  DefaultButton,
  IDialogContentProps,
  IPropsWithStyles,
  IButtonProps
} from '@fluentui/react';
import { themedClassNames } from '../../Core/Utils/FluentUI';
import { useStore } from '../../Stores/Core';
import { commonDialogContentProps, DIALOG_MIN_WIDTH } from '../../Core/Components/Common/Dialog/EdnaDialogStyles';

const MicrosoftLearnRemoveSelectedItemsButtonInner = ({
  styles
}: IPropsWithStyles<IButtonProps, IButtonStyles>): JSX.Element => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const classes = themedClassNames(styles);
  const microsoftLearnStore = useStore('microsoftLearnStore');
  const dialogContentProps: IDialogContentProps = {
    ...commonDialogContentProps,
    title: 'Clear All Selected Tutorials'
  };

  const clearSelectedMsLearnContent = (): void => {
    microsoftLearnStore.clearAssignmentLearnContent();
    setIsDialogOpen(false);
  };

  return (
    <ActionButton
      iconProps={{ iconName: 'Delete' }}
      className={classes.root}
      onClick={() => setIsDialogOpen(true)}
      disabled={!microsoftLearnStore.selectedItems || microsoftLearnStore.selectedItems?.length === 0}
    >
      Clear all Selected Tutorials
      <Dialog
        hidden={!isDialogOpen}
        onDismiss={() => setIsDialogOpen(false)}
        dialogContentProps={dialogContentProps}
        minWidth={DIALOG_MIN_WIDTH}
        subText="Are you sure you want to clear all the associated tutorials from this assignment?"
      >
        <DialogFooter>
          <PrimaryButton onClick={() => clearSelectedMsLearnContent()} text="Clear All" />
          <DefaultButton onClick={() => setIsDialogOpen(false)} text="Cancel" />
        </DialogFooter>
      </Dialog>
    </ActionButton>
  );
};

const microsoftLearnRemoveSelectedItemsButtonStyles = ({ theme }: IThemeOnlyProps): Partial<IButtonStyles> => ({
  root: [
    {
      color: theme.palette.themePrimary,
      minWidth: 'max-content',
      paddingRight: 0,
      paddingLeft: 0,
      selectors: {
        '& .ms-Button-label': {
          marginRight: 0
        },
        '&:disabled': {
          color: theme.semanticColors.buttonTextDisabled
        }
      }
    }
  ]
});

export const MicrosoftLearnRemoveSelectedItemsButton = styled(
  MicrosoftLearnRemoveSelectedItemsButtonInner,
  microsoftLearnRemoveSelectedItemsButtonStyles
);
