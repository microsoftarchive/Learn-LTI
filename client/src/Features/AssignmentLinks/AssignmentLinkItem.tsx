/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import React, { useState } from 'react';
import { AssignmentLink } from '../../Models/AssignmentLink.model';
import { AssignmentLinkDisplayItem } from './AssignmentLinkDisplayItem';
import { styled } from '@fluentui/react';
import { IStylesOnly, SimpleComponentStyles, IThemeOnlyProps } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { themedClassNames } from '../../Core/Utils/FluentUI';
import { AssignmentLinkEditItem } from './AssignmentLinkEditItem';
import {
  AssignmentLinkDisplayItemActionArea,
  AssignmentLinkDisplayItemActionAreaStyles
} from './AssignmentLinkDisplayItemActionArea';

interface AssignmentLinkItemProps {
  link: AssignmentLink;
  disableEdit?: boolean;
}

type AssignmentLinkItemStyles = SimpleComponentStyles<'displayItemWrapper'>;
const AssignmentLinkItemInner = ({
  styles,
  link,
  disableEdit
}: AssignmentLinkItemProps & IStylesOnly<AssignmentLinkItemStyles>): JSX.Element => {
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const classes = themedClassNames(styles);

  return (
    <>
      {isEditMode ? (
        <AssignmentLinkEditItem link={link} onDoneEditing={() => setIsEditMode(false)} />
      ) : (
        <div className={classes.displayItemWrapper}>
          <AssignmentLinkDisplayItem link={link} />
          {!disableEdit && (
            <AssignmentLinkDisplayItemActionArea
              styles={assignmentLinkDisplayItemActionAreaStyles}
              link={link}
              toggleEditMode={() => setIsEditMode(true)}
            />
          )}
        </div>
      )}
    </>
  );
};

const assignmentLinkItemStyles = ({ theme }: IThemeOnlyProps): AssignmentLinkItemStyles => ({
  displayItemWrapper: [
    {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: theme.spacing.l1,
      paddingBottom: theme.spacing.l1,
      wordWrap: 'break-word',
      wordBreak: 'break-word',
    }
  ]
});

const assignmentLinkDisplayItemActionAreaStyles = ({
  theme
}: IThemeOnlyProps): Partial<AssignmentLinkDisplayItemActionAreaStyles> => ({
  root: [
    {
      marginLeft: `calc(${theme.spacing.l2} * 2)`
    }
  ]
});
export const AssignmentLinkItem = styled(AssignmentLinkItemInner, assignmentLinkItemStyles);
