/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { AnimationClassNames, IMessageBarStyles, MessageBar, MessageBarType, styled } from '@fluentui/react';
import { useObserver } from 'mobx-react-lite';
import React from 'react';
import { useStore } from '../../Stores/Core';
import { ServiceError } from '../Utils/Axios/ServiceError';
import { themedClassNames } from '../Utils/FluentUI';
import { IStylesOnly, IThemeOnlyProps } from '../Utils/FluentUI/typings.fluent-ui';

type Store = 'assignment' | 'links' | 'learn-content';

const getErrorMessage = (stores: Store[], error: ServiceError | null) => {
  if (error === null) {
    return undefined;
  }

  const getStoreSpecificMessage = (store: Store) => {
    switch (store) {
      case 'links': return 'links';
      case 'learn-content': return 'Microsoft Learn content';
      case 'assignment': return 'description and deadline';
    }
  };

  let storesWithError = stores.map(store => getStoreSpecificMessage(store)).join(', ');
  let message = `Sorry! An error was encountered, and we could not sync the assignment's ${storesWithError} properly. `;

  switch (error) {
    case 'unauthorized':
      return message + 'It seems like you do not have sufficient permissions to perform this action.';
    case 'not found':
      return message + 'We could not find what you were looking for. Please contact the server administrator or a teacher.'
    case 'bad request':
      return message + 'The server could not process your request.';
    case 'internal error':
    case 'other':
      return message + 'The server encountered an internal error and was unable to complete your request. Please contact the server administrator.'
  }
};

const AssignmentUpdateFailureMessageBarInner = ({ styles }: IStylesOnly<IMessageBarStyles>): JSX.Element | null => {
  const assignmentStore = useStore('assignmentStore');
  const assignmentLinksStore = useStore('assignmentLinksStore');
  const learnStore = useStore('microsoftLearnStore');
  const classes = themedClassNames(styles);

  return useObserver(() => {
    const learnStoreError = learnStore.itemsInErrorState.length !== 0 && !learnStore.serviceCallsInProgress && learnStore.hasServiceError ? learnStore.hasServiceError : null;
    const linkStoreError = !assignmentLinksStore.isSynced && assignmentLinksStore.serviceCallInProgress === 0 && assignmentLinksStore.hasServiceError ? assignmentLinksStore.hasServiceError : null;
    const assignmentError = !assignmentStore.isSynced && assignmentStore.serviceCallInProgress === 0 && assignmentStore.hasServiceError ? assignmentStore.hasServiceError : null;

    let errorMessageMap: Map<ServiceError, Store[]> = new Map<ServiceError, Store[]>();

    const getExistingStoresErrorMap = (err: ServiceError): Store[] => errorMessageMap.get(err) || [];

    if (linkStoreError) {
      errorMessageMap.set(linkStoreError, [...getExistingStoresErrorMap(linkStoreError), 'links']);
    }
    if (learnStoreError) {
      errorMessageMap.set(learnStoreError, [...getExistingStoresErrorMap(learnStoreError), 'learn-content']);
    }
    if (assignmentError) {
      errorMessageMap.set(assignmentError, [...getExistingStoresErrorMap(assignmentError), 'assignment']);
    }

    if (learnStoreError || linkStoreError || assignmentError) {
      return (
        <>
          {[...errorMessageMap].map(([serviceError, stores]) => {
            return (
              <MessageBar messageBarType={MessageBarType.warning} isMultiline={true} className={classes.root}>
                {getErrorMessage(stores, serviceError)}
              </MessageBar>
            );
          })}
        </>
      );
    } else {
      return null;
    }
  });
};

const assignmentUpdateFailureMessageBarStyles = ({ theme }: IThemeOnlyProps): Partial<IMessageBarStyles> => ({
  root: [AnimationClassNames.fadeIn500]
});

export const AssignmentUpdateFailureMessageBar = styled(AssignmentUpdateFailureMessageBarInner, assignmentUpdateFailureMessageBarStyles);
