import { AssignmentLink } from '../../Models/AssignmentLink.model';
import { useState, useEffect } from 'react';

type useLinkReturnType = [AssignmentLink, (link: AssignmentLink) => void, boolean];

export const useLink = (assignmentLink: AssignmentLink): useLinkReturnType => {
  const [link, setLink] = useState<AssignmentLink>(assignmentLink);
  const [canSave, setCanSave] = useState(!!link.url);

  useEffect(() => {
    setCanSave(!!link.url);
  }, [link]);

  return [link, setLink, canSave];
};
