/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import React, { PropsWithChildren } from 'react';
import { IThemeOnlyProps, SimpleComponentStyles, IStylesOnly } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { styled } from '@fluentui/react';
import { themedClassNames } from '../../Core/Utils/FluentUI';
import { PublishControlArea, PublishControlAreaStyles } from '../../Features/PublishAssignment/PublishControlArea';
import { stickyHeaderStyle } from './Common/StickyHeaderStyle';

type MainPagesWrapperStyles = SimpleComponentStyles<'root'>;

const MainPagesWrapperInner = ({
  styles,
  children
}: PropsWithChildren<{}> & IStylesOnly<MainPagesWrapperStyles>): JSX.Element => {
  const classes = themedClassNames(styles);
  return (
    <div className={classes.root}>
      <PublishControlArea styles={themedClassNames(publishControlAreaStyles)} />
      {children}
    </div>
  );
};

const MainPagesWrapperStyles = ({ theme }: IThemeOnlyProps): MainPagesWrapperStyles => ({
  root: [
    {
      flexDirection: 'column',
      backgroundColor: theme.palette.neutralLighterAlt,
      flex: 1,
      overflow: 'auto',
      position: 'relative',
      padding: theme.spacing.l2,
      paddingTop: 0,
      display: 'flex'
    }
  ]
});

const publishControlAreaStyles = ({ theme }: IThemeOnlyProps): Partial<PublishControlAreaStyles> => ({
  root: [stickyHeaderStyle(theme)]
});
export const MainPagesWrapper = styled(MainPagesWrapperInner, MainPagesWrapperStyles);
