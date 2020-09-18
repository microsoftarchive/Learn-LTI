/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { useStore } from '../../Stores/Core';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';

export const useAssignmentInitializer = (): void => {
  const assignmentStore = useStore('assignmentStore');
  const { assignmentId } = useParams();

  useEffect(() => {
    assignmentStore.initializeAssignment(assignmentId);
  }, [assignmentId, assignmentStore]);
};
