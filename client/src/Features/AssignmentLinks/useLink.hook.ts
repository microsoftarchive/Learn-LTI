/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

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
