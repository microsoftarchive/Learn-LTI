import React, { useEffect, useState } from 'react';
import { PageWrapper, PageWrapperStyles } from '../../Core/Components/Common/PageWrapper';
import { Header } from '../../Core/Components/Header';
import { styled, Spinner, SpinnerSize, FontSizes, FontWeights } from '@fluentui/react';
import { SimpleComponentStyles, IStylesOnly, IThemeOnlyProps } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { PlatformRegistrationForm } from './PlatformRegistrationForm';
import { useStore } from '../../Stores/Core';
import { useObserver } from 'mobx-react-lite';
import { themedClassNames } from '../../Core/Utils/FluentUI';
import { Platform } from '../../Models/Platform.model';
import { platformRegistrationFieldGroups } from './PlatformRegistrationFields';
import learnLogo from '../../Assets/icon_learn_062020.png';
import { stickyHeaderStyle } from '../../Core/Components/Common/StickyHeaderStyle';
import { PlatformControlArea, PlatformControlAreaStyles } from './PlatformControlArea';
import { PlatformPageNoAuth } from './PlatformPageNoAuth';
import { NotFoundErrorPage } from '../../Core/Components/ErrorPages/NotFoundErrorPage';
import { InternalErrorPage } from '../../Core/Components/ErrorPages/InternalErrorPage';

type PlatformPageStyles = SimpleComponentStyles<'root' | 'spinner' | 'content' | 'saveButton'>;

const PlatformPageInner = ({ styles }: IStylesOnly<PlatformPageStyles>): JSX.Element => {
  const platformStore = useStore('platformStore');
  const [canSaveSettings, setCanSaveSettings] = useState<boolean>(false);
  const [platformData, setPlatformData] = useState<Platform | null>(null);
  const [showErrorMessages, setShowErrorMessages] = useState<boolean>(false);

  useEffect(() => {
    if (!platformData) {
      return;
    }
    const hasEmptyRequiredField = !!platformRegistrationFieldGroups.find(group =>
      group.fields.find(field => field.isRequired && !platformData[field.fieldName])
    );
    if (showErrorMessages && !hasEmptyRequiredField) {
      setShowErrorMessages(false);
    }
    setCanSaveSettings(!hasEmptyRequiredField);
  }, [platformData, setCanSaveSettings, showErrorMessages]);

  useEffect(() => {
    platformStore.initializePlatform();
  }, [platformStore]);

  const tryToSaveRegistration = (): void => {
    if (!canSaveSettings && !showErrorMessages) {
      setShowErrorMessages(true);
      return;
    }
    if (platformData) {
      platformStore.updatePlatform(platformData);
    }
  };

  const classes = themedClassNames(styles);

  return useObserver(() => (
    <div className={classes.root}>
      <Header
        mainHeader="Microsoft Learn LTI Tool"
        secondaryHeader="Platform Registration"
        logoUrl={learnLogo}
        userInstitution={platformData?.institutionName}
      />
      {platformStore.isNotAuthorized ? (
        <PlatformPageNoAuth />
      ) : !platformStore.platform ? (
        platformStore.responseStatus==="not found" ?
        <NotFoundErrorPage/> :
        platformStore.responseStatus==="internal error" ?
        <InternalErrorPage/> :
        <Spinner
          size={SpinnerSize.large}
          className={classes.spinner}
          label="Loading Platform Settings"
          labelPosition="bottom"
        />
      ) : (
        <div className={classes.content}>
          <PlatformControlArea
            styles={themedClassNames(publishControlAreaStyles)}
            onSaveRegirstrationClicked={tryToSaveRegistration}
            showErrorMessage={showErrorMessages}
          />
          <PageWrapper title="Platform Registration" styles={themedClassNames(pageWrapperStyles)}>
            <PlatformRegistrationForm
              updatePlatformData={data => setPlatformData(data)}
              showErrors={showErrorMessages}
            />
          </PageWrapper>
        </div>
      )}
    </div>
  ));
};

const platformPageStyle = ({ theme }: IThemeOnlyProps): PlatformPageStyles => ({
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
      flexDirection: 'column',
      boxSizing: 'border-box',
      width: '100%',
      height: '100%',
      overflow: 'auto',
      backgroundColor: theme.palette.neutralLighterAlt,
      padding: `0 ${theme.spacing.l2}`,
      paddingBottom: theme.spacing.l2
    }
  ],
  saveButton: [
    {
      alignSelf: 'flex-end',
      textTransform: 'uppercase'
    }
  ]
});

const pageWrapperStyles = ({ theme }: IThemeOnlyProps): Partial<PageWrapperStyles> => ({
  content: [
    {
      paddingLeft: `calc(${theme.spacing.l2} + ${theme.spacing.m})`,
      paddingRight: `calc(${theme.spacing.l2} + ${theme.spacing.m})`
    }
  ]
});

const publishControlAreaStyles = ({ theme }: IThemeOnlyProps): Partial<PlatformControlAreaStyles> => ({
  root: [stickyHeaderStyle(theme)]
});

export const PlatformPage = styled(PlatformPageInner, platformPageStyle);
