import React from 'react';
import { IThemeOnlyProps, SimpleComponentStyles, IStylesOnly } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { styled, MessageBarType, mergeStyles, AnimationClassNames } from '@fluentui/react';
import { themedClassNames } from '../../Core/Utils/FluentUI';
import { PublishStatusIndicator } from './PublishStatusIndicator';
import { PublishActionButtons } from './PublishActionButtons';
import { useObserver } from 'mobx-react-lite';
import { useStore } from '../../Stores/Core';
import { AutohideMessageBar } from '../../Core/Components/AutohideMessageBar';

export type PublishControlAreaStyles = SimpleComponentStyles<'root' | 'messageBar'>;

const PublishControlAreaInner = ({ styles }: IStylesOnly<PublishControlAreaStyles>): JSX.Element => {
  const assignmentStore = useStore('assignmentStore');
  const classes = themedClassNames(styles);

  return useObserver(() => (
    <div className={classes.root}>
      <PublishStatusIndicator />
      {assignmentStore.assignment && (
        <AutohideMessageBar
          messageBarType={MessageBarType.success}
          isMultiline={false}
          className={classes.messageBar}
          showMessageBar={
            assignmentStore.assignment.publishStatus === 'Published' && assignmentStore.isChangingPublishState === false
          }
        >
          Your assignment was published successfully
        </AutohideMessageBar>
      )}
      <PublishActionButtons />
    </div>
  ));
};

const publishControlAreaStyles = ({ theme }: IThemeOnlyProps): PublishControlAreaStyles => ({
  root: [
    {
      padding: `${theme.spacing.l1} 0`,
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      width: '100%'
    }
  ],
  messageBar: [
    mergeStyles(AnimationClassNames.fadeIn200, {
      height: theme.spacing.l2,
      width: 'auto',
      marginLeft: 'auto'
    })
  ]
});

export const PublishControlArea = styled(PublishControlAreaInner, publishControlAreaStyles);
