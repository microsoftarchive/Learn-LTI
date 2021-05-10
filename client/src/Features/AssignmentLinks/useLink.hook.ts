/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { useState, useEffect, useCallback } from 'react';
import { AssignmentLink } from '../../Models/AssignmentLink.model';
import { isValidURL, ValidateDescLength, ValidateTitleLength } from './AssignmentLinkEditor';

type useLinkReturnType = [AssignmentLink, (link: AssignmentLink) => void, boolean];

export const useLink = (assignmentLink: AssignmentLink): useLinkReturnType => {
  const [link, setLink] = useState<AssignmentLink>(assignmentLink);

  const isValidLink = useCallback((link: AssignmentLink) => {
    const titleIsValid = (text: string) => ValidateTitleLength(text) === '';
    const descIsValid = (text: string) => ValidateDescLength(text) === '';
    const urlIsValid = (url: string) => isValidURL(url) && url.length > 0;

    return titleIsValid(link.displayText) && urlIsValid(link.url) && descIsValid(link.description);
  }, []);

  const [canSave, setCanSave] = useState(isValidLink(link));

  useEffect(() => {
    setCanSave(isValidLink(link));
  }, [link, isValidLink]);

  return [link, setLink, canSave];
};
