import React from 'react';
import { IThemeOnlyProps, SimpleComponentStyles, IStylesOnly } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { styled, Link, Persona, PersonaSize, PersonaInitialsColor, Text, FontWeights } from '@fluentui/react';
import { themedClassNames } from '../../Core/Utils/FluentUI';
import { useStore } from '../../Stores/Core';
import { useObserver } from 'mobx-react-lite';

const userDetailsUrlBase = 'https://account.activedirectory.windowsazure.com/profile?ref=MeControl&login_hint=';

type UserMenuProfileStyles = SimpleComponentStyles<'root' | 'image' | 'info' | 'name' | 'email'>;

const UserMenuProfileInner = ({ styles }: IStylesOnly<UserMenuProfileStyles>): JSX.Element | null => {
  const usersStore = useStore('usersStore');
  const classes = themedClassNames(styles);
  return useObserver(() => {
    if (!usersStore.userDetails) {
      return null;
    }
    return (
      <div className={classes.root}>
        <Persona
          className={classes.image}
          size={PersonaSize.size72}
          hidePersonaDetails
          text={usersStore.userDetails?.displayName}
          initialsColor={PersonaInitialsColor.coolGray}
          imageUrl={usersStore.userImageUrl}
        />
        <div className={classes.info}>
          <Text nowrap block variant="large" className={classes.name}>
            {usersStore.userDetails.displayName}
          </Text>
          <Text nowrap block variant="medium" className={classes.email}>
            {usersStore.userDetails.email}
          </Text>
          <Link target="_blank" href={`${userDetailsUrlBase}${usersStore.userDetails?.email}`}>
            view profile
          </Link>
        </div>
      </div>
    );
  });
};

const UserMenuProfileStyles = ({ theme }: IThemeOnlyProps): UserMenuProfileStyles => ({
  root: [
    {
      padding: theme.spacing.l1,
      display: 'flex',
      maxWidth: `calc(${theme.spacing.l2} * 10)`
    }
  ],
  image: [
    {
      marginRight: theme.spacing.l1
    }
  ],
  info: [
    {
      overflow: 'hidden'
    }
  ],
  name: [
    {
      color: theme.palette.neutralPrimary,
      fontWeight: FontWeights.bold
    }
  ],
  email: [
    {
      marginBottom: theme.spacing.s1,
      color: theme.palette.neutralPrimary
    }
  ]
});

export const UserMenuProfile = styled(UserMenuProfileInner, UserMenuProfileStyles);
