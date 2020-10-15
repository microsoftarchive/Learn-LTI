/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import React from 'react';
import { SimpleComponentStyles, IStylesOnly, IThemeOnlyProps } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import moment from 'moment';
import { styled, mergeStyleSets, Text } from '@fluentui/react';
import { themedClassNames } from '../../Core/Utils/FluentUI';
import { StudentViewSection, StudentViewSectionStyles, StudentViewSectionProps } from './StudentViewSection';
import { useStore } from '../../Stores/Core';
import { AssignmentLinksList } from '../AssignmentLinks/AssignmentLinksList';
import { useObserver } from 'mobx-react-lite';
import _ from 'lodash';
import { StudentViewLearnItemsList } from './StudentViewLearnItemsList';


interface StudentViewContentProps {
  requirePublished?: boolean;
}

type StudentViewContentStyles = SimpleComponentStyles<'root'>;

const formatDate = (assignmentDate?: Date): string => {
  return assignmentDate ? moment(assignmentDate).format('MMMM DD YYYY') : '';
};

const StudentViewContentInner = ({ styles, requirePublished }: StudentViewContentProps & IStylesOnly<StudentViewContentStyles>): JSX.Element => {
  const classes = themedClassNames(styles);

  const assignmentStore = useStore('assignmentStore');
  const assignmentLinksStore = useStore('assignmentLinksStore');
  const learnStore = useStore('microsoftLearnStore');

  return useObserver(() => {
    const syncedContentsToDisplay = [...learnStore.contentSelectionMap].filter(value => !value[1].callsInProgress && value[1].syncedState==='selected').map(item => item[0]);
    const items: (StudentViewSectionProps & IStylesOnly<StudentViewSectionStyles>)[] = _.compact([
      assignmentStore.syncedDescription && {
        title: 'Description',
        textContent: assignmentStore.syncedDescription
      },
      assignmentStore.syncedDeadline && {
        title: 'Deadline',
        textContent: formatDate(assignmentStore.syncedDeadline)
      },
      (assignmentLinksStore.isLoading || assignmentLinksStore.syncedAssignmentLinks.length > 0) && {
        title: 'Links',
        styles: linksSectionStyles,
        content: <AssignmentLinksList disableEdit showSynced/>
      },
      syncedContentsToDisplay &&
      syncedContentsToDisplay.length > 0 && {
          title: 'Tutorials',
          content: <StudentViewLearnItemsList />
        }
    ]);

    return (
      <div className={classes.root}> {
        requirePublished && assignmentStore.assignment?.publishStatus !== "Published"
          ? <Text>This assignment is not yet Published</Text>
          : items.length === 0
            ? <Text>No info was entered for this assignment</Text>
            : items.map(item => {
                const itemSpecificStyles = themedClassNames(item.styles);
                const baseStyles = themedClassNames(baseSectionStyles);
                const styles = mergeStyleSets(baseStyles, itemSpecificStyles);
                return <StudentViewSection key={item.title} {...item} styles={styles} />;
              })
      } </div>
    );
  });
};

const studentViewContentStyles = ({ theme }: IThemeOnlyProps): StudentViewContentStyles => ({
  root: [{}]
});

const linksSectionStyles = (): Partial<StudentViewSectionStyles> => ({
  root: [
    {
      paddingBottom: 0
    }
  ],
  title: [
    {
      marginBottom: 0
    }
  ]
});

const baseSectionStyles = ({ theme }: IThemeOnlyProps): Partial<StudentViewSectionStyles> => ({
  root: [
    {
      borderColor: theme.semanticColors.bodyDivider,
      paddingBottom: `calc(${theme.spacing.l1} + ${theme.spacing.s2})`,
      paddingTop: `calc(${theme.spacing.l1} + ${theme.spacing.s2})`,
      borderBottomStyle: 'solid',
      borderBottomWidth: 1,
      selectors: {
        '&:first-child': {
          paddingTop: 0
        },
        '&:last-child': {
          paddingBottom: 0,
          borderBottomWidth: 0
        }
      }
    }
  ]
});

export const StudentViewContent = styled(StudentViewContentInner, studentViewContentStyles);
