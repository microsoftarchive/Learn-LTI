/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import React, { useState } from 'react';
import { IThemeOnlyProps, SimpleComponentStyles, IStylesOnly } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import {
  styled,
  PrimaryButton,
  DefaultButton,
  IButtonStyles,
  IIconProps,
  IIconStyles,
  FontSizes,
  classNamesFunction,
  getTheme,
  ITheme,
  mergeStyleSets
} from '@fluentui/react';
import { themedClassNames } from '../../Core/Utils/FluentUI';
import { useStore } from '../../Stores/Core';
import { useObserver } from 'mobx-react-lite';
import { MotionDurations, MotionTimings } from '@uifabric/fluent-theme';
import { PublishStatusDialog } from './PublishStatusDialog';

type PublishActionButtonsStyles = SimpleComponentStyles<'root'>;
interface EditButtonStyleProps {
  isPublished: boolean;
  theme: ITheme;
}

const PublishActionButtonsInner = ({ styles }: IStylesOnly<PublishActionButtonsStyles>): JSX.Element => {
  const assignmentStore = useStore('assignmentStore');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState<boolean>(false);

  const classes = themedClassNames(styles);

  const changeAssignmentPublishStatus = async (newPublishStatus: boolean): Promise<void> => {
    await assignmentStore.changeAssignmentPublishStatus(newPublishStatus);
    setIsPublishDialogOpen(false);
    setIsEditDialogOpen(false);
  };

  return useObserver(() => {
    const editButtonClassNames = classNamesFunction<EditButtonStyleProps, IButtonStyles>()(editButtonStyle, {
      isPublished: assignmentStore?.assignment?.publishStatus === 'Published',
      theme: getTheme()
    });

    return (
      <div className={classes.root}>
        <DefaultButton
          text="Edit"
          styles={editButtonClassNames}
          iconProps={editIconProps}
          onClick={() => setIsEditDialogOpen(true)}
          disabled={!!assignmentStore.isChangingPublishState}
        >
          <PublishStatusDialog
            onApprove={() => changeAssignmentPublishStatus(false)}
            onDismiss={() => setIsEditDialogOpen(false)}
            approveButtonText="Edit"
            isOpen={isEditDialogOpen}
            subText={
              'By switching to Edit mode, the assignment will not be visible to the students.\nDo you want to continue?'
            }
            title="Switch to Edit Mode"
          />
        </DefaultButton>

        <PrimaryButton
          text="Publish"
          styles={themedClassNames(publishButtonStyle)}
          disabled={
            !assignmentStore ||
            !assignmentStore.assignment ||
            assignmentStore.assignment.publishStatus === 'Published' ||
            !!assignmentStore.isChangingPublishState
          }
          onClick={() => setIsPublishDialogOpen(true)}
        >
          <PublishStatusDialog
            onApprove={() => changeAssignmentPublishStatus(true)}
            onDismiss={() => setIsPublishDialogOpen(false)}
            approveButtonText="Publish"
            isOpen={isPublishDialogOpen}
            subText={
              'You are about to Publish the assignment and make it visible to the students.\nAre you sure you want to proceed?'
            }
            title="Publish"
          />
        </PrimaryButton>
      </div>
    );
  });
};

const PublishActionButtonsStyles = (): PublishActionButtonsStyles => ({
  root: [
    {
      marginLeft: `auto`,
      display: 'flex',
      justifyContent: 'center'
    }
  ]
});
const commonButtonStyle: Partial<IButtonStyles> = {
  root: [
    {
      width: 160,
      transitionDuration: MotionDurations.duration1,
      transitionTimingFunction: MotionTimings.accelerate
    }
  ]
};

const editButtonStyle = ({ theme, isPublished }: EditButtonStyleProps): Partial<IButtonStyles> =>
  mergeStyleSets(commonButtonStyle, {
    root: [
      {
        marginRight: `calc(${theme.spacing.s1} + ${theme.spacing.s2})`,
        color: theme.palette.themePrimary,
        borderColor: theme.palette.themePrimary,
        display: isPublished ? 'block' : 'none'
      }
    ],
    textContainer: [
      {
        flexGrow: 0
      }
    ]
  });

const publishButtonStyle = ({ theme }: IThemeOnlyProps): Partial<IButtonStyles> =>
  mergeStyleSets(commonButtonStyle, {
    root: [
      {
        backgroundColor: theme.palette.themeDark
      }
    ]
  });

const editIconStyle = ({ theme }: IThemeOnlyProps): Partial<IIconStyles> => ({
  root: [
    {
      fontSize: FontSizes.medium,
      marginRight: theme.spacing.s1
    }
  ]
});

const editIconProps: IIconProps = { iconName: 'edit', styles: themedClassNames(editIconStyle) };

export const PublishActionButtons = styled(PublishActionButtonsInner, PublishActionButtonsStyles);
