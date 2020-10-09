import { AnimationClassNames, IMessageBarStyles, MessageBar, MessageBarType, styled } from '@fluentui/react';
import { useObserver } from 'mobx-react-lite';
import React from 'react';
import { useStore } from '../../Stores/Core';
import { themedClassNames } from '../Utils/FluentUI';
import { IStylesOnly, IThemeOnlyProps } from '../Utils/FluentUI/typings.fluent-ui';

const UnsyncedAssignmentStickeyMessageBarInner = ({ styles }: IStylesOnly<IMessageBarStyles>): JSX.Element | null => {
  const assignmentStore = useStore('assignmentStore');
  const assignmentLinksStore = useStore('assignmentLinksStore');
  const learnStore = useStore('microsoftLearnStore');
  const classes = themedClassNames(styles);

  return useObserver(() => {
    const isAssignmentSynced = learnStore.isSynced && assignmentLinksStore.isSynced; // && assignmentStore.isSynced;

    if (isAssignmentSynced === false) {
      return (
        <MessageBar messageBarType={MessageBarType.warning} isMultiline={true} className={classes.root}>
          Some parts of the assignment were not updated successfully. Please head to the Preview section to see the
          saved state of the assignment which will be visible to the students.
        </MessageBar>
      );
    } else {
      return null;
    }
  });
};

const unsyncedAssignmentMessageBarStyles = ({ theme }: IThemeOnlyProps): Partial<IMessageBarStyles> => ({
  root: [AnimationClassNames.fadeIn200]
});

export const UnsyncedAssignmentStickeyMessageBar = styled(
  UnsyncedAssignmentStickeyMessageBarInner,
  unsyncedAssignmentMessageBarStyles
);
