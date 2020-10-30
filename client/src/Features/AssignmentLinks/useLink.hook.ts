/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { AssignmentLink } from '../../Models/AssignmentLink.model';
import { useState, useEffect } from 'react';
import { isValidURL } from './AssignmentLinkEditor';

type useLinkReturnType = [AssignmentLink, (link: AssignmentLink) => void, boolean];

export const useLink = (assignmentLink: AssignmentLink): useLinkReturnType => {
  const [link, setLink] = useState<AssignmentLink>(assignmentLink);

  const isValidLink = (link: AssignmentLink) => {
    return link.url.length>0 && isValidURL(link.url) && link.displayText.length<=500 && link.description.length<=1000;
  }

  const [canSave, setCanSave] = useState(isValidLink(link))

  useEffect(() => {
    setCanSave(isValidLink(link));
  }, [link]);

  return [link, setLink, canSave];
};
