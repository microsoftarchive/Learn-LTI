import { AnimationClassNames, IMessageBarStyles, MessageBar, MessageBarType, styled } from '@fluentui/react';
import { useObserver } from 'mobx-react-lite';
import React from 'react';
import { useStore } from '../../Stores/Core';
import { ServiceError } from '../Utils/Axios/ServiceError';
import { themedClassNames } from '../Utils/FluentUI';
import { IStylesOnly, IThemeOnlyProps } from '../Utils/FluentUI/typings.fluent-ui';

const getErrorMessage = (error: ServiceError | null, isSynced: boolean | null) => {
  switch (error) {
    case 'unauthorized':
      return 'Sorry, but it seems like you do not have sufficient permissions to perform this action.';
    case 'internal error':
      return 'Sorry, the server encountered an internal error and was unable to complete your request. Please contact the server administrator.';
    case 'not found':
      return 'Sorry, we could not find what you were looking for. Please contact the server administrator or the teacher.';
    case 'bad request':
      return 'Sorry, but the server could not process your request.';
    case 'other':
      return 'Sorry, something went wrong, and we could not process your request successfully.';
  }

  if (error === null && isSynced === false) {
    return 'Some parts of the assignment were not updated successfully. Please head to the Preview section to see the saved state of the assignment, which will be visible to the students.';
  }
};

const AssignmentUpdateFailureMessageBarInner = ({ styles }: IStylesOnly<IMessageBarStyles>): JSX.Element | null => {
  const assignmentStore = useStore('assignmentStore');
  const assignmentLinksStore = useStore('assignmentLinksStore');
  const learnStore = useStore('microsoftLearnStore');
  const classes = themedClassNames(styles);

  const getServiceError = () =>
  {
      if(learnStore.hasServiceError) {
        return learnStore.hasServiceError;
      }else if(assignmentLinksStore.hasServiceError) {
        return assignmentLinksStore.hasServiceError;
      }else if(assignmentStore.hasServiceError) {
        return assignmentStore.hasServiceError;
      }
      return null;
  }
  return useObserver(() => {
    const isAssignmentSynced = learnStore.isSynced && assignmentLinksStore.isSynced && assignmentStore.isSynced;
    const isCallInProgress = assignmentLinksStore.serviceCallInProgress + learnStore.serviceCallInProgress + assignmentStore.serviceCallInProgress;
    const hasError = getServiceError();
    const errorMessage = getErrorMessage(hasError, isAssignmentSynced);

    if ( isCallInProgress === 0 && (hasError !== null || isAssignmentSynced === false)) {
      return (
        <MessageBar messageBarType={MessageBarType.warning} isMultiline={true} className={classes.root}>
          {errorMessage}
        </MessageBar>
      );
    } else {
      return null;
    }
  });
};

const assignmentUpdateFailureMessageBarStyles = ({ theme }: IThemeOnlyProps): Partial<IMessageBarStyles> => ({
  root: [AnimationClassNames.fadeIn200]
});

export const AssignmentUpdateFailureMessageBar = styled(
  AssignmentUpdateFailureMessageBarInner,
  assignmentUpdateFailureMessageBarStyles
);
