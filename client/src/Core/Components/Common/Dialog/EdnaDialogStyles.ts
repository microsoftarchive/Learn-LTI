import { IDialogContentStyles, DialogType, IDialogContentProps } from '@fluentui/react';

export const DIALOG_MIN_WIDTH = 640;

const dialogContentStyles = (): Partial<IDialogContentStyles> => {
  return {
    inner: [
      {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 240
      }
    ],
    subText: [
      {
        whiteSpace: 'pre-wrap'
      }
    ]
  };
};

export const commonDialogContentProps: IDialogContentProps = {
  type: DialogType.close,
  closeButtonAriaLabel: 'Close',
  styles: dialogContentStyles
};
