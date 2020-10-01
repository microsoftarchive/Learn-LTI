import React from 'react';
import { IThemeOnlyProps, SimpleComponentStyles, IStylesOnly } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { styled, mergeStyles, AnimationClassNames } from '@fluentui/react';
import { themedClassNames } from '../../Core/Utils/FluentUI';
import { PublishStatusIndicator } from './PublishStatusIndicator';
import { PublishActionButtons } from './PublishActionButtons';
import { useObserver } from 'mobx-react-lite';

export type PublishControlAreaStyles = SimpleComponentStyles<'root'>;

const PublishControlAreaInner = ({ styles }: IStylesOnly<PublishControlAreaStyles>): JSX.Element => {
  const classes = themedClassNames(styles);

  return useObserver(() => (
    <>
    <div className={classes.root}>
      <PublishStatusIndicator />
      <PublishActionButtons />
    </div>
  </>
  ));
};

const publishControlAreaStyles = ({ theme }: IThemeOnlyProps): PublishControlAreaStyles => ({
  root: [
    {
      position:"relative",
      padding: `calc(${theme.spacing.l1}*0.75) 0`,
      display: 'flex',
      flexDirection: 'row',
      width: 'max-content'
    }
  ]
});

export const PublishControlArea = styled(PublishControlAreaInner, publishControlAreaStyles);
