import React from 'react';
import { IThemeOnlyProps, SimpleComponentStyles, IStylesOnly } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { styled } from '@fluentui/react';
import { themedClassNames } from '../../Core/Utils/FluentUI';
import { PublishStatusIndicator } from './PublishStatusIndicator';
import { PublishActionButtons } from './PublishActionButtons';
import { PublishSuccessMessageBar } from './PublishSuccessMessageBar';
import { useObserver } from 'mobx-react-lite';
import { useStore } from '../../Stores/Core';

export type PublishControlAreaStyles = SimpleComponentStyles<'root'>;

const PublishControlAreaInner = ({ styles }: IStylesOnly<PublishControlAreaStyles>): JSX.Element => {
  const assignmentStore = useStore('assignmentStore');

  const classes = themedClassNames(styles);

  return useObserver(() => (
    <div className={classes.root}>
      <PublishStatusIndicator />
      {assignmentStore.assignment && (
        <PublishSuccessMessageBar isPublished={assignmentStore.assignment.publishStatus === 'Published'} />
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
  ]
});

export const PublishControlArea = styled(PublishControlAreaInner, publishControlAreaStyles);
