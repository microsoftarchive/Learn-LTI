/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import React from 'react';
import { Header } from './Header';
import { styled, Spinner, SpinnerSize, FontSizes, FontWeights, Text, mergeStyles } from '@fluentui/react';
import { SimpleComponentStyles, IThemeOnlyProps, IStylesOnly } from '../Utils/FluentUI/typings.fluent-ui';
import { PagesRouter } from '../../Router/PagesRouter';
import { useObserver } from 'mobx-react-lite';
import { useStore } from '../../Stores/Core';
import { useAssignmentInitializer } from '../Hooks/useAssignmentInitializer';
import { themedClassNames } from '../Utils/FluentUI';
import { StudentPage } from '../../Features/StudentView/StudentPage';
import learnLogo from '../../Assets/icon_learn_062020.png';
import { useQueryValue } from '../Hooks';
import { ErrorPage } from './ErrorsPage';
import { PublishControlArea, PublishControlAreaStyles } from '../../Features/PublishAssignment/PublishControlArea';
import { PublishSuccessMessageBar } from '../../Features/PublishAssignment/PublishSuccessMessageBar';
import * as NavBarBase from './Navbar'
import { stickyHeaderStyle } from './Common/StickyHeaderStyle';

type MainLayoutStyles = SimpleComponentStyles<'root' | 'spinner' | 'content' | 'assignmentTitle' | 'navAndControlArea'>;

const MainLayoutInner = ({ styles }: IStylesOnly<MainLayoutStyles>): JSX.Element => {
  useAssignmentInitializer();
  const assignmentStore = useStore('assignmentStore');
  const usersStore = useStore('usersStore');

  const asStudent: boolean = useQueryValue('asStudent') !== null;

  const classes = themedClassNames(styles);
  return useObserver(() => (
    <div className={classes.root}>
      <Header
        mainHeader={assignmentStore.assignment?.courseName}
        logoUrl={assignmentStore.assignment?.platformPersonalization?.logoUrl || learnLogo}
        userInstitution={assignmentStore.assignment?.platformPersonalization?.institutionName}
      />
      {!assignmentStore.assignment || !usersStore.userDetails ? (
        assignmentStore.errorContent !== undefined ? (
          <ErrorPage {...assignmentStore.errorContent} /> 
        ) : (
        usersStore.errorContent !== undefined ? (
          <ErrorPage {...usersStore.errorContent} /> 
        ) : (
        <Spinner
          size={SpinnerSize.large}
          className={classes.spinner}
          label="Loading Assignment"
          labelPosition="bottom"
        />
        ))) : (
        <div className={classes.content}>
          {usersStore.userDetails.role === 'teacher' && !asStudent ? (
            <>
              <Text variant="xLargePlus" className={classes.assignmentTitle}>
                {assignmentStore.assignment.name}
              </Text>
              <div className={classes.navAndControlArea}>
                <NavBarBase.NavbarTop />                  
                <PublishControlArea  />
              </div>
              <PublishSuccessMessageBar isPublished={assignmentStore.assignment.publishStatus === 'Published'} />
              <PagesRouter />
            </>
          ) : (
            <StudentPage />
          )}
        </div>
      )}
    </div>
  ));
};

const mainLayoutStyle = ({ theme }: IThemeOnlyProps): MainLayoutStyles => {
  return {
    root: [
      {
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.neutralLighterAlt,
      }
    ],
    spinner: [
      {
        justifyContent: 'flex-start',
        margin: `${theme.spacing.l2} auto`,
        selectors: {
          '& .ms-Spinner-label': {
            fontSize: FontSizes.large,
            fontWeight: FontWeights.bold
          }
        }
      }
    ],
    content: [
      {
        display: 'flex',
        width: '100%',
        overflow: 'hidden',
        height: '100%',
        flexDirection:'column'
      }
    ],
    assignmentTitle: [
      {
        color: theme.palette.neutralPrimary,
        backgroundColor: theme.palette.neutralLighterAlt,
        lineHeight: FontSizes.xxLarge,
        paddingLeft: `calc(${theme.spacing.l1}*1.6)`,
        paddingBottom: `calc(${theme.spacing.l1}*0.5)`,
        paddingTop:`calc(${theme.spacing.l1}*1.5)`,
      }
    ],
    navAndControlArea: [
      mergeStyles(stickyHeaderStyle(theme), { 
        display: 'flex',
        backgroundColor: theme.palette.neutralLighterAlt,
        marginLeft: `calc(${theme.spacing.l1} * 1.6)`,
        marginRight: `calc(${theme.spacing.l1} * 1.6)`,
        height:`calc(${theme.spacing.l1} * 2.7)`,
        flexDirection: 'row',
        justifyContent: 'space-between',  
      })
    ]
  };
};

export const MainLayout = styled(MainLayoutInner, mainLayoutStyle);
