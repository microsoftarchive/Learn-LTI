/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { AssignmentLink } from '../../Models/AssignmentLink.model';
import { useState, useEffect } from 'react';
import { isValidURL, ValidateDescLength, ValidateTitleLength } from './AssignmentLinkEditor';

type useLinkReturnType = [AssignmentLink, (link: AssignmentLink) => void, boolean];

export const useLink = (assignmentLink: AssignmentLink): useLinkReturnType => {
  const [link, setLink] = useState<AssignmentLink>(assignmentLink);

  const titleIsValid = ValidateTitleLength(link.displayText) === "";
  const descIsValid = ValidateDescLength(link.description) === "";
  const urlIsValid = isValidURL(link.url) && link.url.length>0;

  const isValidLink = titleIsValid && urlIsValid && descIsValid;

  const [canSave, setCanSave] = useState(isValidLink)

  useEffect(() => {
    setCanSave(isValidLink);
  }, [link, isValidLink]);

  return [link, setLink, canSave];
};
