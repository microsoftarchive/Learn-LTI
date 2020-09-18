/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import React from 'react';
import {
  styled,
  Text,
  Separator,
  FontWeights,
  Image,
  IImageStyleProps,
  IImageStyles,
  AnimationClassNames,
  getTheme
} from '@fluentui/react';
import { SimpleComponentStyles, IStylesOnly, IThemeOnlyProps } from '../Utils/FluentUI/typings.fluent-ui';
import { themedClassNames } from '../Utils/FluentUI';
import { UserDetails } from './UserDetails';

interface HeaderProps {
  mainHeader?: string;
  secondaryHeader?: string;
  userInstitution?: string;
  logoUrl?: string;
}

type HeaderStyles = SimpleComponentStyles<
  'root' | 'mainContent' | 'mainHeader' | 'separator' | 'secondaryHeader' | 'userSection'
>;

const HeaderInner = ({
  mainHeader,
  secondaryHeader,
  userInstitution,
  logoUrl,
  styles
}: IStylesOnly<HeaderStyles> & HeaderProps): JSX.Element => {
  const classes = themedClassNames(styles);
  return (
    <div className={classes.root}>
      <div className={classes.mainContent}>
        {logoUrl && <Image src={logoUrl} styles={imageStyles} height={40} />}
        <Text variant="xLargePlus" className={classes.mainHeader}>
          {mainHeader}
        </Text>
        {secondaryHeader && <Separator vertical className={classes.separator} />}
        <Text variant="xLarge" className={classes.secondaryHeader}>
          {secondaryHeader}
        </Text>
      </div>
      <div className={classes.userSection}>
        <UserDetails userInstitutionName={userInstitution} />
      </div>
    </div>
  );
};

const headerStyles = ({ theme }: IThemeOnlyProps): HeaderStyles => ({
  root: [
    {
      width: '100%',
      backgroundColor: theme.palette.themePrimary,
      color: theme.palette.white,
      boxShadow: theme.effects.elevation8,
      display: 'flex',
      position: 'sticky',
      zIndex: 2
    }
  ],
  mainContent: [
    {
      padding: `${theme.spacing.s2} ${theme.spacing.s1}`,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center'
    }
  ],
  mainHeader: [
    {
      fontWeight: FontWeights.regular,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      marginLeft: theme.spacing.m
    }
  ],
  separator: [
    {
      margin: `0 ${theme.spacing.s1}`,
      selectors: {
        ':after': {
          backgroundColor: theme.palette.whiteTranslucent40
        }
      }
    }
  ],
  secondaryHeader: [
    {
      fontWeight: FontWeights.regular,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  ],
  userSection: [
    {
      marginLeft: 'auto'
    }
  ]
});

const imageStyles = ({ isLoaded }: IImageStyleProps): Partial<IImageStyles> => {
  const theme = getTheme();
  return {
    root: [
      isLoaded &&
        (AnimationClassNames.slideRightIn40,
        {
          marginLeft: theme.spacing.s1
        })
    ],
    image: [
      {
        maxWidth: 150,
        maxHeight: '100%',
        objectFit: 'contain'
      }
    ]
  };
};
export const Header = styled(HeaderInner, headerStyles);
