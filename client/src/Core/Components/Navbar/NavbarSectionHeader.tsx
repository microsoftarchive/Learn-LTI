/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import React from 'react';
import { styled, FontSizes, FontWeights, Text } from '@fluentui/react';
import { IStylesOnly, IThemeOnlyProps, SimpleComponentStyles } from '../../Utils/FluentUI/typings.fluent-ui';
import { themedClassNames } from '../../Utils/FluentUI';

interface NavbarSectionHeaderProps {
  name: string;
}

type NavBarSectionsHeaderStyles = SimpleComponentStyles<'root'>;

const NavbarSectionHeaderInner = ({
  name,
  styles
}: IStylesOnly<NavBarSectionsHeaderStyles> & NavbarSectionHeaderProps): JSX.Element => {
  const classes = themedClassNames(styles);
  return (
    <Text variant="medium" className={classes.root}>
      {name}
    </Text>
  );
};

const navBarSectionsHeaderStyles = ({ theme }: IThemeOnlyProps): NavBarSectionsHeaderStyles => ({
  root: [
    {
      color: theme.palette.black,
      lineHeight: FontSizes.xLarge,
      marginLeft: theme.spacing.l1,
      fontWeight: FontWeights.semibold,
      marginBottom: theme.spacing.s1,
      marginTop: theme.spacing.s1
    }
  ]
});

export const NavbarSectionHeader = styled(NavbarSectionHeaderInner, navBarSectionsHeaderStyles);
