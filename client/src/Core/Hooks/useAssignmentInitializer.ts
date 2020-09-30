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
