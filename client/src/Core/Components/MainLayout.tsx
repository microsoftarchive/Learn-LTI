import React from 'react';
import { Header } from './Header';
import { styled, Spinner, SpinnerSize, FontSizes, FontWeights, Text } from '@fluentui/react';
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
import { NavPivot } from './Navbar/NavPivot';

type MainLayoutStyles = SimpleComponentStyles<'root' | 'spinner' | 'content' | 'assignmentTitle'>;

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
        secondaryHeader={assignmentStore.assignment?.name}
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
            <Text variant="xLargePlus" className={classes.assignmentTitle}>
              {assignmentStore.assignment.name}
            </Text>
          {usersStore.userDetails.role === 'teacher' && !asStudent ? (
            <>
              <NavPivot/>
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
        flexDirection: 'column'
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
    ]
  };
};

export const MainLayout = styled(MainLayoutInner, mainLayoutStyle);
