/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import React from 'react';
import { IThemeOnlyProps } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { getId, mergeStyleSets, PrimaryButton } from '@fluentui/react';
import { themedClassNames } from '../../Core/Utils/FluentUI';
import { InputGroupWrapper, InputGroupWrapperStyles } from '../../Core/Components/Common/InputGroupWrapper';
import { AssignmentLinkEditor, editableLinkFields } from '../AssignmentLinks/AssignmentLinkEditor';
import { useLink } from '../AssignmentLinks/useLink.hook';
import { generalPageInputGroupChildrenStyleProps } from './GeneralPageStyles';
import { v4 as uuidv4 } from 'uuid';
import { AssignmentLink } from '../../Models/AssignmentLink.model';
import { useStore } from '../../Stores/Core';
import { getPrefixedLink } from '../AssignmentLinks/getPrefixedLink';

const LinksCreatorInputInner = (): JSX.Element => {
  const emptyLink: AssignmentLink = {
    displayText: '',
    url: '',
    description: '',
    id: uuidv4()
  };
  const [link, setLink, canSave] = useLink(emptyLink);
  const assignmentLinksStore = useStore('assignmentLinksStore');

  const handleAddClicked = (): void => {
    assignmentLinksStore.addAssignmentLink({ ...link, url: getPrefixedLink(link.url) });
    setLink(emptyLink);
  };

  const themedLinksCreatorInputGroupWrapperStyle = themedClassNames(linksCreatorInputGroupWrapperStyle);
  const linkTextFieldId: string = getId('linkText');
  return (
    <>
      <InputGroupWrapper
        label={'Add link'}
        labelElementId={linkTextFieldId}
        styles={mergeStyleSets(generalPageInputGroupChildrenStyleProps, themedLinksCreatorInputGroupWrapperStyle)}
      >
        <AssignmentLinkEditor
          link={link}
          linkTextFieldId={linkTextFieldId}
          onChangeTextField={(field: editableLinkFields, newValue: string) => {
            setLink({ ...link, [field]: newValue });
          }}
        />
        <PrimaryButton text="Add Link" onClick={handleAddClicked} disabled={!canSave} />
      </InputGroupWrapper>
    </>
  );
};

const linksCreatorInputGroupWrapperStyle = ({ theme }: IThemeOnlyProps): InputGroupWrapperStyles => {
  return {
    childrenWrapper: [
      {
        paddingTop: theme.spacing.l2,
        paddingBottom: theme.spacing.l2
      }
    ],
    label: [
      {
        paddingTop: theme.spacing.l2
      }
    ]
  };
};
export const LinksCreatorInput = LinksCreatorInputInner;
