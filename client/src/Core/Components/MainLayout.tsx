/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import React from 'react';
import { Header } from './Header';
import { styled, Spinner, SpinnerSize, FontSizes, FontWeights } from '@fluentui/react';
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
import { NavigationControlHeader } from './NavigationControlHeader';
import { AssignmentUpdateFailureMessageBar } from './AssignmentUpdateFailureMessageBar';

type MainLayoutStyles = SimpleComponentStyles<'root' | 'spinner' | 'content'>;

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
              <AssignmentUpdateFailureMessageBar/>
              <NavigationControlHeader/>
              <PagesRouter />
            </>
          ) : (
            <>
              <AssignmentUpdateFailureMessageBar/>
              <StudentPage />
            </>
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
    ]
  };
};

export const MainLayout = styled(MainLayoutInner, mainLayoutStyle);
