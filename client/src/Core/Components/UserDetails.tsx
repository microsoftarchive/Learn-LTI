/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import React from 'react';
import { useStore } from '../../Stores/Core';
import { useObserver } from 'mobx-react-lite';
import {
  Text,
  styled,
  Persona,
  PersonaSize,
  PersonaInitialsColor,
  FontWeights,
  AnimationClassNames
} from '@fluentui/react';
import { SimpleComponentStyles, IThemeOnlyProps, IStylesOnly } from '../Utils/FluentUI/typings.fluent-ui';
import { themedClassNames } from '../Utils/FluentUI';
import { UserMenu } from './UserMenu';

type UserDetailsStyles = SimpleComponentStyles<'root' | 'name' | 'details' | 'institution'>;

interface UserDetailsProps {
  userInstitutionName?: string;
}

const UserDetailsInner = ({
  userInstitutionName,
  styles
}: UserDetailsProps & IStylesOnly<UserDetailsStyles>): JSX.Element | null => {
  const usersStore = useStore('usersStore');
  const classes = themedClassNames(styles);

  return useObserver(() => {
    if (!usersStore.userDetails) {
      return null;
    }
    return (
      <UserMenu>
        <div className={classes.root}>
          <div className={classes.details}>
            <Text className={classes.name} variant="medium">
              {usersStore.userDetails.displayName}
            </Text>
            {userInstitutionName && (
              <Text className={classes.institution} variant="smallPlus">
                {userInstitutionName}
              </Text>
            )}
          </div>
          <Persona
            size={PersonaSize.size32}
            hidePersonaDetails
            text={usersStore.userDetails.displayName}
            initialsColor={PersonaInitialsColor.coolGray}
            imageUrl={usersStore.userImageUrl}
          />
        </div>
      </UserMenu>
    );
  });
};
const userDetailsStyles = ({ theme }: IThemeOnlyProps): UserDetailsStyles => ({
  root: [
    {
      display: 'flex',
      flexDirection: 'row'
    }
  ],
  details: [
    {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      marginRight: theme.spacing.s1
    }
  ],
  name: [
    {
      fontWeight: FontWeights.semibold,
      color: theme.palette.white
    }
  ],
  institution: [
    AnimationClassNames.fadeIn100,
    {
      color: theme.palette.white,
      opacity: 0.9,
      textTransform: 'uppercase'
    }
  ]
});

export const UserDetails = styled(UserDetailsInner, userDetailsStyles);
