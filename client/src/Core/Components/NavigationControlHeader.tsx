/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { SpinnerSize } from '@fluentui/react';
import { Spinner } from '@fluentui/react';
import { FontSizes, FontWeights, mergeStyles, MessageBarType, styled } from '@fluentui/react';
import _ from 'lodash';
import { useObserver } from 'mobx-react-lite';
import React from 'react';
import { PublishControlArea } from '../../Features/PublishAssignment/PublishControlArea';
import {
  PublishSuccessMessageBar,
  PublishSuccessMessageBarProps
} from '../../Features/PublishAssignment/PublishSuccessMessageBar';
import { useStore } from '../../Stores/Core';
import { themedClassNames } from '../Utils/FluentUI';
import { IStylesOnly, IThemeOnlyProps, SimpleComponentStyles } from '../Utils/FluentUI/typings.fluent-ui';
import { stickyHeaderStyle } from './Common/StickyHeaderStyle';
import * as NavBarBase from './Navbar';

type NavigationControlHeaderStyles = SimpleComponentStyles<'assignmentTitle' | 'navAndControlArea' | 'header'>;

function NavigationControlHeaderInner({ styles }: IStylesOnly<NavigationControlHeaderStyles>): JSX.Element {
  const assignmentStore = useStore('assignmentStore');
  const assignmentLinksStore = useStore('assignmentLinksStore');
  const learnStore = useStore('microsoftLearnStore');
  const classes = themedClassNames(styles);

  return useObserver(() => {
    const isCallInProgress = learnStore.isLoadingCatalog? 0 : assignmentLinksStore.serviceCallInProgress + _.sum([...learnStore.contentSelectionMap.values()].map(item => item.callsInProgress)) + (learnStore.clearCallInProgress ? 1 : 0) + (learnStore.clearCallsToMake? 1 : 0) + assignmentStore.serviceCallInProgress;
    const publishStatusMessageBarProps: PublishSuccessMessageBarProps =
      assignmentStore.pushlishStatusChangeError === 'unauthorized'
        ? {
            messageBarType: MessageBarType.error,
            message: 'Sorry, but it seems like you do not have sufficient permissions to perform this action.',
            showMessage: assignmentStore.pushlishStatusChangeError === 'unauthorized'
          }
        : assignmentStore.pushlishStatusChangeError !== null
        ? {
            messageBarType: MessageBarType.error,
            message:
              assignmentStore.assignment?.publishStatus !== 'Published'
                ? 'Something went wrong! Could not publish the assignment'
                : 'Something went wrong! Could not switch to edit mode',
            showMessage: assignmentStore.pushlishStatusChangeError !== null
          }
        : {
            messageBarType: MessageBarType.success,
            message: 'Your assignment was published successfully',
            showMessage:
              assignmentStore.assignment?.publishStatus === 'Published' &&
              assignmentStore.isChangingPublishState === false
          };

    return (
      <>
        <div className={classes.header}>
          <span className={classes.assignmentTitle}>{assignmentStore.assignment?.name}</span>
          {isCallInProgress > 0 && <Spinner label="Updating..." labelPosition="left" size={SpinnerSize.small}/>}
        </div>
        <div className={classes.navAndControlArea}>
          <NavBarBase.NavbarTop />
          <PublishControlArea />
        </div>
        <PublishSuccessMessageBar {...publishStatusMessageBarProps} />
      </>
    );
  });
}

const navigationControlHeaderStyle = ({ theme }: IThemeOnlyProps): NavigationControlHeaderStyles => {
  return {
    header: [
      {
        display: 'flex',
        justifyContent: 'space-between',
        paddingRight: `calc(${theme.spacing.l1} * 1.6)`,
        paddingLeft: `calc(${theme.spacing.l1} * 1.6)`,
        paddingBottom: `calc(${theme.spacing.l1} * 0.5)`,
        paddingTop: `calc(${theme.spacing.l1} * 1.5)`
      }
    ],
    assignmentTitle: [
      {
        fontSize: FontSizes.xLargePlus,
        fontWeight: FontWeights.semibold,
        color: theme.palette.neutralPrimary,
        backgroundColor: theme.palette.neutralLighterAlt,
        lineHeight: FontSizes.xxLarge,
      }
    ],

    navAndControlArea: [
      mergeStyles(stickyHeaderStyle(theme), {
        display: 'flex',
        backgroundColor: theme.palette.neutralLighterAlt,
        marginLeft: `calc(${theme.spacing.l1} * 1.6)`,
        marginRight: `calc(${theme.spacing.l1} * 1.6)`,
        height: `calc(${theme.spacing.l1} * 2.7)`,
        flexDirection: 'row',
        justifyContent: 'space-between'
      })
    ]
  };
};

export const NavigationControlHeader = styled(NavigationControlHeaderInner, navigationControlHeaderStyle);
