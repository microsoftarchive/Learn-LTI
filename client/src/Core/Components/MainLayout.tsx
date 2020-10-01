import React from 'react';
import { Header } from './Header';
import { styled, Spinner, SpinnerSize, FontSizes, FontWeights, Text, Separator, NavBase } from '@fluentui/react';
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
import { PublishControlArea } from '../../Features/PublishAssignment/PublishControlArea';
import { PublishSuccessMessageBar } from '../../Features/PublishAssignment/PublishSuccessMessageBar';
import * as NavBarBase from './Navbar'

type MainLayoutStyles = SimpleComponentStyles<'root' | 'spinner' | 'content' | 'assignmentTitle' | 'navAndControlArea' | 'separator'>;

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
                <PublishControlArea/>
              </div>
              <Separator className={classes.separator} />
              <PublishSuccessMessageBar isPublished={assignmentStore.assignment.publishStatus === 'Published'}/>
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
      {
        display: 'flex',
        backgroundColor: theme.palette.neutralLighterAlt,
        paddingLeft: `calc(${theme.spacing.l1} * 1.6)`,
        paddingRight: `calc(${theme.spacing.l1} * 1.6)`,     
        height:`calc(${theme.spacing.l1} * 2.7)`,
        flexDirection: 'row',
        justifyContent: 'space-between',  
      }
    ],
    separator: [
      {
        height: '1px',
        backgroundColor: '#E1DFDD',
        padding: `0px 0px`
      }
    ]
  };
};

export const MainLayout = styled(MainLayoutInner, mainLayoutStyle);
