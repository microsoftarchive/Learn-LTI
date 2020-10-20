/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { AnimationClassNames, classNamesFunction, getTheme, IMessageBarStyles, ITheme, MessageBar, MessageBarType } from '@fluentui/react';
import { useObserver } from 'mobx-react-lite';
import React from 'react';
import { useStore } from '../../Stores/Core';
import { ServiceError } from '../Utils/Axios/ServiceError';
import { IStylesOnly } from '../Utils/FluentUI/typings.fluent-ui';

interface AssignmentUpdateFailureMessageBarStyleProps {
  fade: 'fadeIn' | 'fadeOut';
  theme: ITheme;
}

const getErrorMessage = (error: ServiceError | null) => {
  switch (error) {
    case 'unauthorized':
      return 'Sorry, but it seems like you do not have sufficient permissions to perform this action.';
    case 'not found':
      return 'Sorry, we could not find what you were looking for. Please contact the server administrator or the teacher.';
    case 'bad request':
      return 'Sorry, but the server could not process your request.';
    case 'internal error':
    case 'other':
      return 'Sorry, the server encountered an internal error and was unable to complete your request. Please contact the server administrator.';
  }
};

const AssignmentUpdateFailureMessageBarInner = ({ styles }: IStylesOnly<IMessageBarStyles>): JSX.Element | null => {
  const assignmentStore = useStore('assignmentStore');
  const assignmentLinksStore = useStore('assignmentLinksStore');
  const learnStore = useStore('microsoftLearnStore');

  return useObserver(() => {
    const learnStoreCallsInProgress =
      !learnStore.isLoadingCatalog &&
      (learnStore.serviceCallsInProgress || learnStore.clearCallInProgress || learnStore.clearCallsToMake)
        ? 1
        : 0;
    const isCallInProgress =
      learnStoreCallsInProgress + assignmentLinksStore.serviceCallInProgress + assignmentStore.serviceCallInProgress > 0;
    
    // use this instead of learnstore.hasServiceError
    // const learnStoreErr = learnStore.itemsInErrorState.length!==0 && learnStore.hasServiceError? learnStore.hasServiceError : null; 
    
    const hasError = learnStore.hasServiceError || assignmentStore.hasServiceError || assignmentLinksStore.hasServiceError;
    const errorMessage = getErrorMessage(hasError);

    const assignmentUpdateFailureMessageBarClass = classNamesFunction<AssignmentUpdateFailureMessageBarStyleProps, IMessageBarStyles>()(assignmentUpdateFailureMessageBarStyles, {
      fade: isCallInProgress? 'fadeOut' : 'fadeIn', 
      theme: getTheme()
    })

    if (hasError !== null) {
      return (
        <MessageBar messageBarType={MessageBarType.warning} isMultiline={true} styles={assignmentUpdateFailureMessageBarClass}>
          {errorMessage}
        </MessageBar>
      );
    } else {
      return null;
    }
  });
};

const assignmentUpdateFailureMessageBarStyles = ({ fade, theme }: AssignmentUpdateFailureMessageBarStyleProps): Partial<IMessageBarStyles> => ({
  root: [fade==='fadeIn'? AnimationClassNames.fadeIn500 : AnimationClassNames.fadeOut500]
});

export const AssignmentUpdateFailureMessageBar = AssignmentUpdateFailureMessageBarInner
