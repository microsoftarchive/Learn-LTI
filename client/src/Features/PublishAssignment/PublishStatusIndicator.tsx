/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import React from 'react';
import { IStylesOnly, IThemeOnlyProps, SimpleComponentStyles } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { FontIcon, FontSizes, IStyle, mergeStyles, Spinner, styled, Text } from '@fluentui/react';
import { themedClassNames } from '../../Core/Utils/FluentUI';
import { useStore } from '../../Stores/Core';
import { useObserver } from 'mobx-react-lite';

type PublishStatusIndicatorStyles = SimpleComponentStyles<'root' | 'text' | 'publishedIcon' | 'unpublishedIcon'>;

const PublishStatusIndicatorInner = ({ styles }: IStylesOnly<PublishStatusIndicatorStyles>): JSX.Element | null => {
  const assignmentStore = useStore('assignmentStore');

  const classes = themedClassNames(styles);

  return useObserver(() => {
    if (!assignmentStore.assignment) {
      return null;
    }
    if (assignmentStore.isChangingPublishState) {
      return (
        <div className={classes.root}>
          <Spinner />
          <Text variant="medium" className={classes.text}>
            {assignmentStore.assignment.publishStatus === 'Published' ? 'Switching to edit mode...' : 'Publishing...'}
          </Text>
        </div>
      );
    }

    return (
      <div className={classes.root}>
        <FontIcon
          iconName={assignmentStore.assignment.publishStatus === 'Published' ? 'CompletedSolid' : 'Blocked'}
          className={
            assignmentStore.assignment.publishStatus === 'Published' ? classes.publishedIcon : classes.unpublishedIcon
          }
        />
        <Text variant="medium" className={classes.text}>
          {assignmentStore.assignment.publishStatus === 'Published' ? 'Published' : 'Not Published'}
        </Text>
      </div>
    );
  });
};

const textIconStyle: IStyle = {
  lineHeight: FontSizes.large
};

const publishStatusIndicatorStyles = ({ theme }: IThemeOnlyProps): PublishStatusIndicatorStyles => ({
  root: [
    {
      display: 'flex',
      alignItems: 'center'
    }
  ],
  text: [
    mergeStyles(textIconStyle, {
      marginLeft: theme.spacing.s1
    })
  ],
  publishedIcon: [
    mergeStyles(textIconStyle, {
      color: theme.semanticColors.successIcon
    })
  ],
  unpublishedIcon: [
    mergeStyles(textIconStyle, {
      fontSize: FontSizes.medium
    })
  ]
});

export const PublishStatusIndicator = styled(PublishStatusIndicatorInner, publishStatusIndicatorStyles);
