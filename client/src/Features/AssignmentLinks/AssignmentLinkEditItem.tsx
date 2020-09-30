/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import React from 'react';
import { IThemeOnlyProps, SimpleComponentStyles, IStylesOnly } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { styled, PrimaryButton, DefaultButton } from '@fluentui/react';
import { themedClassNames } from '../../Core/Utils/FluentUI';
import { AssignmentLinkEditor, editableLinkFields } from './AssignmentLinkEditor';
import { AssignmentLink } from '../../Models/AssignmentLink.model';
import { useLink } from './useLink.hook';
import { useStore } from '../../Stores/Core';
import { getPrefixedLink } from './getPrefixedLink';

interface AssignmentLinkEditItemProps {
  link: AssignmentLink;
  onDoneEditing: (link?: AssignmentLink) => void;
}
type AssignmentLinkEditItemStyles = SimpleComponentStyles<'root' | 'actionArea' | 'cancelButton'>;

const AssignmentLinkEditItemInner = ({
  styles,
  link: savedLink,
  onDoneEditing
}: AssignmentLinkEditItemProps & IStylesOnly<AssignmentLinkEditItemStyles>): JSX.Element => {
  const [link, setLink, canSave] = useLink(savedLink);
  const assignmentLinksStore = useStore('assignmentLinksStore');
  const handleSaveClicked = (): void => {
    onDoneEditing();
    assignmentLinksStore.editAssignmentLink({ ...link, url: getPrefixedLink(link.url) });
  };
  const classes = themedClassNames(styles);
  return (
    <div className={classes.root}>
      <AssignmentLinkEditor
        link={link}
        onChangeTextField={(field: editableLinkFields, newValue: string) => {
          setLink({ ...link, [field]: newValue });
        }}
      />
      <div className={classes.actionArea}>
        <PrimaryButton text={'Save Changes'} onClick={handleSaveClicked} disabled={!canSave} />
        <DefaultButton className={classes.cancelButton} text="Cancel" onClick={() => onDoneEditing()} />
      </div>
    </div>
  );
};

const assignmentLinkEditItemStyles = ({ theme }: IThemeOnlyProps): AssignmentLinkEditItemStyles => ({
  root: [
    {
      paddingBottom: theme.spacing.l2,
      paddingTop: theme.spacing.l2
    }
  ],
  actionArea: [
    {
      justifySelf: 'flex-start'
    }
  ],
  cancelButton: [
    {
      marginLeft: theme.spacing.m
    }
  ]
});

export const AssignmentLinkEditItem = styled(AssignmentLinkEditItemInner, assignmentLinkEditItemStyles);
