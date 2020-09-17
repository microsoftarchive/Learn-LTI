/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import React from 'react';
import { IThemeOnlyProps, SimpleComponentStyles, IStylesOnly } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import {
  styled,
  Image,
  ImageFit,
  Link,
  Text,
  FontSizes,
  FontWeights,
  FontIcon,
  IconButton,
  IButtonStyles,
  TooltipHost,
  TooltipOverflowMode,
  ITooltipHostStyles,
  AnimationClassNames,
  mergeStyles
} from '@fluentui/react';
import { themedClassNames } from '../../Core/Utils/FluentUI';
import { getTypeText, getDurationText } from './MicrosoftLearnItemMappings';
import { Depths } from '@uifabric/fluent-theme/lib/fluent/FluentDepths';
import { useStore } from '../../Stores/Core';
import { useObserver } from 'mobx-react-lite';
import { getCommonHorizontalSpacer, getCommonSpacingStyle } from './MicrosoftLearnStyles';

interface MicrosoftLearnSelectedItemProps {
  itemId: string;
}
export type MicrosoftLearnSelectedItemStyles = SimpleComponentStyles<
  'root' | 'itemIcon' | 'content' | 'tooltipHost' | 'details' | 'info' | 'dot'
>;

const MicrosoftLearnSelectedItemInner = ({
  styles,
  itemId
}: MicrosoftLearnSelectedItemProps & IStylesOnly<MicrosoftLearnSelectedItemStyles>): JSX.Element | null => {
  const learnStore = useStore('microsoftLearnStore');

  const classes = themedClassNames(styles);
  const buttonClass = themedClassNames(removeButtonStyle);

  return useObserver(() => {
    const item = learnStore.catalog?.contents.get(itemId);
    if (!item) {
      return null;
    }
    return (
      <div className={mergeStyles(classes.root, AnimationClassNames.slideUpIn20)}>
        <Image src={item.icon_url} className={classes.itemIcon} imageFit={ImageFit.contain} />
        <div className={classes.content}>
          <Link target="_blank" href={item.url}>
            <TooltipHost
              overflowMode={TooltipOverflowMode.Self}
              hostClassName={classes.tooltipHost}
              content={item.title}
              styles={hostStyles}
            >
              {item.title}
            </TooltipHost>
          </Link>
          <div className={classes.details}>
            <Text variant="mediumPlus" className={classes.info}>
              {getDurationText(item.duration_in_minutes)}
            </Text>
            <FontIcon iconName="LocationDot" className={classes.dot} />
            <Text variant="mediumPlus" className={classes.info}>
              {getTypeText(item.type)}
            </Text>
          </div>
        </div>
        <IconButton
          styles={buttonClass}
          iconProps={{ iconName: 'ErrorBadge' }}
          onClick={() => {
            learnStore.removeItemSelection(item.uid);
          }}
        />
      </div>
    );
  });
};

export const microsoftLearnSelectedItemStyles = ({ theme }: IThemeOnlyProps): MicrosoftLearnSelectedItemStyles => ({
  root: [
    mergeStyles(getCommonSpacingStyle(theme), {
      boxSizing: 'border-box',
      width: `calc(100% - ${getCommonHorizontalSpacer(theme)} * 2)`,
      height: `calc(${theme.spacing.l1}*4 + ${theme.spacing.s1})`,
      borderRadius: 3,
      border: '1px solid black',
      borderColor: theme.palette.neutralTertiaryAlt,
      boxShadow: Depths.depth4,
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing.s1
    })
  ],
  itemIcon: [
    {
      marginRight: theme.spacing.s1,
      marginLeft: theme.spacing.s1,
      height: `calc(2*${theme.spacing.l2})`,
      width: `calc(2*${theme.spacing.l2})`
    }
  ],
  content: [
    {
      alignSelf: 'stretch',
      flex: 1,
      padding: theme.spacing.s1,
      overflow: 'hidden'
    }
  ],
  tooltipHost: [
    {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      flex: 1,
      fontSize: FontSizes.medium,
      fontWeight: FontWeights.bold,
      color: theme.palette.neutralSecondary,
      marginBottom: theme.spacing.s1
    }
  ],
  details: [
    {
      display: 'flex',
      alignItems: 'center'
    }
  ],
  info: [
    {
      color: theme.palette.neutralSecondaryAlt,
      fontWeight: FontWeights.semibold
    }
  ],
  dot: [
    {
      fontSize: FontSizes.small,
      marginTop: theme.spacing.s2,
      marginRight: theme.spacing.s1,
      marginLeft: theme.spacing.s1,
      color: theme.palette.neutralTertiaryAlt,
      boxSizing: 'border-box'
    }
  ]
});

const removeButtonStyle = ({ theme }: IThemeOnlyProps): Partial<IButtonStyles> => ({
  root: [
    {
      color: theme.palette.neutralTertiaryAlt,
      padding: theme.spacing.s1,
      alignSelf: 'flex-start',
      margin: theme.spacing.s2
    }
  ],
  rootHovered: [
    {
      backgroundColor: 'none'
    }
  ],
  rootPressed: [
    {
      backgroundColor: 'none',
      color: theme.palette.neutralDark
    }
  ],
  icon: [
    {
      fontSize: FontSizes.xxLargePlus
    }
  ]
});

const hostStyles: Partial<ITooltipHostStyles> = {
  root: { display: 'block' }
};

export const MicrosoftLearnSelectedItem = styled(MicrosoftLearnSelectedItemInner, microsoftLearnSelectedItemStyles);
