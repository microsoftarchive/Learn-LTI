/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import React from 'react';
import { IThemeOnlyProps, SimpleComponentStyles, IStylesOnly } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { styled, Link, Text, FontSizes, IStyle, mergeStyles } from '@fluentui/react';
import { themedClassNames } from '../../Core/Utils/FluentUI';
import { AssignmentLink } from '../../Models/AssignmentLink.model';

interface AssignmentLinkDisplayItemProps {
  link: AssignmentLink;
}

export type AssignmentLinkDisplayItemStyles = SimpleComponentStyles<'root' | 'displayText' | 'descriptionText'>;

const AssignmentLinkDisplayItemInner = ({
  styles,
  link
}: AssignmentLinkDisplayItemProps & IStylesOnly<AssignmentLinkDisplayItemStyles>): JSX.Element => {
  const classes = themedClassNames(styles);
  return (
    <div className={classes.root}>
      <Link target="_blank" href={link.url} className={classes.displayText}>
        {link.displayText || link.url}
      </Link>
      <Text block className={classes.descriptionText}>
        {link.description}
      </Text>
    </div>
  );
};

export const assignmentLinkDisplayItemStyles = ({ theme }: IThemeOnlyProps): AssignmentLinkDisplayItemStyles => {
  const baseTextStyle: IStyle = {
    lineHeight: FontSizes.xxLarge,
    fontSize: FontSizes.medium
  };

  return {
    root: [
      {
        width: '100%'
      }
    ],
    displayText: [
      mergeStyles(baseTextStyle, {
        color: theme.palette.themePrimary
      })
    ],
    descriptionText: [mergeStyles(baseTextStyle, { color: theme.palette.neutralPrimary })]
  };
};

export const AssignmentLinkDisplayItem = styled(AssignmentLinkDisplayItemInner, assignmentLinkDisplayItemStyles);
