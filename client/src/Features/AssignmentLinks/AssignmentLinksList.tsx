/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import React from 'react';
import { SimpleComponentStyles, IStylesOnly } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { styled, Separator, ITheme } from '@fluentui/react';
import { AssignmentLinkItem } from './AssignmentLinkItem';
import { useStore } from '../../Stores/Core';
import { useObserver } from 'mobx-react-lite';
import { themedClassNames } from '../../Core/Utils/FluentUI';
import { AssignmentLinkItemShimmer } from './AssignmentLinkItemShimmer';

interface AssignmentLinksListProps {
  disableEdit?: boolean;
  showSynced?: boolean;
}
export type AssignmentLinksListStyles = SimpleComponentStyles<'root' | 'itemsDividerSeparator'>;
type AssignmentLinksListStylesProps = {
  theme: ITheme;
};

const AssignmentLinksListInner = ({
  styles,
  disableEdit,
  showSynced
}: AssignmentLinksListProps & IStylesOnly<AssignmentLinksListStyles>): JSX.Element => {
  const assignmentLinksStore = useStore('assignmentLinksStore');

  const assignmentLinksToDisplay = showSynced? assignmentLinksStore.syncedAssignmentLinks : assignmentLinksStore.assignmentLinks;

  const classes = themedClassNames(styles);

  return useObserver(() => {
    return (
      <div className={classes.root}>
        {assignmentLinksStore.isLoading ? (
          <AssignmentLinkItemShimmer />
        ) : (
          <>
            { assignmentLinksToDisplay.map((link, index) => (
              <React.Fragment key={link.id}>
                {index !== 0 && <Separator className={classes.itemsDividerSeparator} />}
                <AssignmentLinkItem link={link} disableEdit={disableEdit} />
              </React.Fragment>
            ))}
          </>
        )}
      </div>
    );
  });
};

const assignmentLinksListStyles = ({ theme }: AssignmentLinksListStylesProps): AssignmentLinksListStyles => {
  return {
    root: [],
    itemsDividerSeparator: [
      {
        fontSize: 0,
        padding: 0,
        selectors: {
          '::before': {
            backgroundColor: theme.palette.neutralTertiaryAlt
          }
        }
      }
    ]
  };
};

export const AssignmentLinksList = styled(AssignmentLinksListInner, assignmentLinksListStyles);
