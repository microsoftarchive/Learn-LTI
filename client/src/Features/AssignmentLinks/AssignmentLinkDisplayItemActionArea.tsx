import React, { useState } from 'react';
import { IThemeOnlyProps, SimpleComponentStyles, IStylesOnly } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import {
  styled,
  IconButton,
  Dialog,
  IDialogContentProps,
  DefaultButton,
  PrimaryButton,
  Text,
  DialogFooter,
  FontWeights
} from '@fluentui/react';
import { themedClassNames } from '../../Core/Utils/FluentUI';
import { useStore } from '../../Stores/Core';
import { AssignmentLink } from '../../Models/AssignmentLink.model';
import { commonDialogContentProps, DIALOG_MIN_WIDTH } from '../../Core/Components/Common/Dialog/EdnaDialogStyles';

interface AssignmentLinkDisplayItemActionAreaProps {
  toggleEditMode: () => void;
  link: AssignmentLink;
}
export type AssignmentLinkDisplayItemActionAreaStyles = SimpleComponentStyles<
  'root' | 'dialogQuestionText' | 'dialogQuestionTextLinkName'
>;

const AssignmentLinkDisplayItemActionAreaInner = ({
  styles,
  toggleEditMode,
  link
}: AssignmentLinkDisplayItemActionAreaProps & IStylesOnly<AssignmentLinkDisplayItemActionAreaStyles>): JSX.Element => {
  const classes = themedClassNames(styles);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const assignmentLinksStore = useStore('assignmentLinksStore');
  const dialogContentProps: IDialogContentProps = {
    ...commonDialogContentProps,
    title: 'Delete Link'
  };

  return (
    <div className={classes.root}>
      <IconButton iconProps={{ iconName: 'Edit' }} onClick={toggleEditMode} />
      <IconButton iconProps={{ iconName: 'Delete' }} onClick={() => setIsDialogOpen(true)}>
        <Dialog
          hidden={!isDialogOpen}
          onDismiss={() => setIsDialogOpen(false)}
          dialogContentProps={dialogContentProps}
          minWidth={DIALOG_MIN_WIDTH}
        >
          <Text className={classes.dialogQuestionText}>
            Are you sure you want to delete the link “
            <span className={classes.dialogQuestionTextLinkName}>{link.displayText || link.url}</span>
            ”?
          </Text>
          <DialogFooter>
            <PrimaryButton onClick={() => assignmentLinksStore.deleteAssignmentLink(link.id)} text="Delete" />
            <DefaultButton onClick={() => setIsDialogOpen(false)} text="Cancel" />
          </DialogFooter>
        </Dialog>
      </IconButton>
    </div>
  );
};

const assignmentLinkDisplayItemActionAreaStyles = ({
  theme
}: IThemeOnlyProps): AssignmentLinkDisplayItemActionAreaStyles => ({
  root: [
    {
      display: 'flex'
    }
  ],
  dialogQuestionText: [
    {
      color: theme.semanticColors.bodySubtext
    }
  ],
  dialogQuestionTextLinkName: [
    {
      fontWeight: FontWeights.semibold
    }
  ]
});

export const AssignmentLinkDisplayItemActionArea = styled(
  AssignmentLinkDisplayItemActionAreaInner,
  assignmentLinkDisplayItemActionAreaStyles
);
