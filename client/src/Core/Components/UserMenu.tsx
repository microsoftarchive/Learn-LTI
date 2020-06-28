import React, { PropsWithChildren } from 'react';
import { IThemeOnlyProps, SimpleComponentStyles, IStylesOnly } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { styled, IButtonStyles, IRenderFunction, FontSizes } from '@fluentui/react';
import {
  ContextualMenuItemType,
  IContextualMenuProps,
  IContextualMenuItem,
  IContextualMenuListProps,
  DirectionalHint,
  IContextualMenuStyles,
  IContextualMenuSubComponentStyles
} from 'office-ui-fabric-react/lib/ContextualMenu';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { themedClassNames } from '../../Core/Utils/FluentUI';
import { useConstCallback } from '@uifabric/react-hooks';
import { UserMenuProfile } from './UserMenuProfile';
import AzureAD, { IAzureADFunctionProps } from 'react-aad-msal';
import { AppAuthConfig } from '../Auth/AppAuthConfig';

type UserMenuStyles = SimpleComponentStyles<'logoutMenuItem' | 'logoutIcon'>;

const UserMenuInner = ({ styles, children }: PropsWithChildren<{}> & IStylesOnly<UserMenuStyles>): JSX.Element => {
  const classes = themedClassNames(styles);

  const getMenuItems = (logout: () => void): IContextualMenuItem[] => [
    {
      key: 'logout',
      text: 'Sign out',
      iconProps: {
        iconName: 'SignOut',
        className: classes.logoutIcon
      },
      onClick: () => logout(),
      className: classes.logoutMenuItem
    },
    {
      key: 'divider_1',
      itemType: ContextualMenuItemType.Divider
    }
  ];

  const renderMenuList = useConstCallback(
    (
      menuListProps: IContextualMenuListProps | undefined,
      defaultRender: IRenderFunction<IContextualMenuListProps> | undefined
    ) => {
      return (
        <>
          {defaultRender && menuListProps && defaultRender(menuListProps)}
          <UserMenuProfile />
        </>
      );
    }
  );

  const getMenuProps = (logout: () => void): IContextualMenuProps => ({
    onRenderMenuList: renderMenuList,
    shouldFocusOnMount: true,
    items: getMenuItems(logout),
    directionalHint: DirectionalHint.bottomRightEdge,
    styles: contextualMenuStyles
  });

  return (
    <AzureAD provider={AppAuthConfig}>
      {({ logout }: IAzureADFunctionProps) => (
        <ActionButton menuProps={getMenuProps(logout)} styles={themedClassNames(buttonStyles)}>
          {children}
        </ActionButton>
      )}
    </AzureAD>
  );
};

const UserMenuStyles = ({ theme }: IThemeOnlyProps): UserMenuStyles => ({
  logoutMenuItem: [
    {
      display: 'flex',
      justifySelf: 'flex-end',
      justifyContent: 'flex-end',
      selectors: {
        '& .ms-ContextualMenu-link': {
          padding: theme.spacing.s1,
          width: 'auto',
          height: 'auto'
        }
      }
    }
  ],
  logoutIcon: [
    {
      lineHeight: `calc(${theme.spacing.l1} * 2)`,
      fontSize: FontSizes.medium,
      marginTop: 0
    }
  ]
});

const buttonStyles = ({ theme }: IThemeOnlyProps): Partial<IButtonStyles> => ({
  root: [
    {
      height: '100%',
      padding: `0 ${theme.spacing.s1}`,
      selectors: {
        ':hover': {
          backgroundColor: theme.palette.themeDarkAlt
        },
        '& .ms-Icon': {
          display: 'none'
        }
      }
    }
  ]
});

const contextualMenuStyles = (): Partial<IContextualMenuStyles> => ({
  subComponentStyles: contualMenuStubComponentStyles()
});

const contualMenuStubComponentStyles = (): IContextualMenuSubComponentStyles => ({
  callout: {
    root: [
      {
        right: '0 !important'
      }
    ]
  },
  menuItem: [{}]
});
export const UserMenu = styled(UserMenuInner, UserMenuStyles);
