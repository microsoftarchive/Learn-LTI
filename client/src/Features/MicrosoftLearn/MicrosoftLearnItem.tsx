/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import React from 'react';
import _ from 'lodash';
import { SimpleComponentStyles, IStylesOnly } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import {
  styled,
  Image,
  ImageFit,
  Link,
  Text,
  classNamesFunction,
  ITheme,
  getTheme,
  mergeStyles,
  FontSizes,
  FontWeights,
  Checkbox,
  ICheckboxStyles,
  mergeStyleSets
} from '@fluentui/react';
import { Depths, MotionDurations, MotionTimings } from '@uifabric/fluent-theme';
import { themedClassNames } from '../../Core/Utils/FluentUI';
import {
  getTypeText,
  getProductColor,
  getProductText,
  getDurationText,
  getProductAncestor
} from './MicrosoftLearnItemMappings';
import { LearnContent } from '../../Models/Learn/LearnContent.model';
import { useStore } from '../../Stores/Core';
import { Product } from '../../Models/Learn';
import { checkBoxStyle } from '../../Core/Components/Common/Inputs/EdnaInputStyles';
import { useObserver } from 'mobx-react-lite';
import { getCommonHorizontalSpacer, getCommonSpacingStyle } from './MicrosoftLearnStyles';

interface MicrosoftLearnItemProps {
  item: LearnContent;
}

type MicrosoftLearnItemStylesProps = {
  theme: ITheme;
  productDetails?: Product;
  isSelected?: boolean;
};

export type MicrosoftLearnItemStyles = SimpleComponentStyles<
  | 'root'
  | 'innerRoot'
  | 'topBar'
  | 'icon'
  | 'content'
  | 'type'
  | 'title'
  | 'duration'
  | 'tag'
  | 'footer'
  | 'learnMoreLink'
>;

const MicrosoftLearnItemInner = ({
  styles,
  item
}: MicrosoftLearnItemProps & IStylesOnly<MicrosoftLearnItemStyles>): JSX.Element => {
  const learnStore = useStore('microsoftLearnStore');
  const mainProductId = _.head(item.products) || '';
  const productCatalogDetails = learnStore.catalog?.products.get(mainProductId);
  const productAncestor =
    productCatalogDetails && getProductAncestor(productCatalogDetails, learnStore.catalog?.products);

  const roles = learnStore.catalog?.roles;
  const roleName = roles?.get(_.head(item.roles) || '')?.name;

  const levels = learnStore.catalog?.levels;
  const levelName = levels?.get(_.head(item.levels) || '')?.name;

  const productText = getProductText(productAncestor);

  const checkboxClass = mergeStyleSets(
    themedClassNames(checkBoxStyle),
    themedClassNames(microsoftLearnItemCheckBoxStyle)
  );

  return useObserver(() => {
    const isSelected = !!learnStore.selectedItems?.find(selectedItem => selectedItem.contentUid === item.uid);
    const classNames = classNamesFunction<MicrosoftLearnItemStylesProps, MicrosoftLearnItemStyles>()(styles, {
      theme: getTheme(),
      productDetails: productCatalogDetails,
      isSelected
    });

    const classes = themedClassNames(classNames);
    return (
      <div className={classes.root}>
        <div onClick={() => learnStore.toggleItemSelection(item.uid)} className={classes.innerRoot}>
          <div>
            <div className={mergeStyles(classes.topBar)}>
              <Image src={item.icon_url} className={classes.icon} imageFit={ImageFit.contain} />
            </div>
            <div className={classes.content}>
              <Text block variant="small" className={classes.type}>
                {getTypeText(item.type)}
              </Text>
              <Text variant="mediumPlus" className={classes.title}>
                {item.title}
              </Text>
              <Text variant="small" className={classes.duration}>
                {getDurationText(item.duration_in_minutes)}
              </Text>
              <div>
                {productText && <div className={classes.tag}>{productText}</div>}
                {roleName && <div className={classes.tag}>{roleName}</div>}
                {levelName && <div className={classes.tag}>{levelName}</div>}
              </div>
            </div>
          </div>
          <div className={classes.footer}>
            <Link
              target="_blank"
              href={item.url}
              className={classes.learnMoreLink}
              onClick={event => event.stopPropagation()}
            >
              LEARN MORE
            </Link>
            <Checkbox styles={checkboxClass} checked={isSelected} />
          </div>
        </div>
      </div>
    );
  });
};

export const microsoftLearnItemCheckBoxStyle = (): Partial<ICheckboxStyles> => ({
  root: [
    {
      pointerEvents: 'none'
    }
  ]
});

export const microsoftLearnItemStyles = ({
  theme,
  productDetails,
  isSelected
}: MicrosoftLearnItemStylesProps): MicrosoftLearnItemStyles => {
  const productColor = getProductColor(productDetails);
  const itemBorderWidth = 2;
  const transitionDuration = MotionDurations.duration3;
  const transitionTimingFunction = MotionTimings.standard;
  const topBorderRadius = 6;

  return {
    root: [
      mergeStyles(getCommonSpacingStyle(theme), {
        borderWidth: itemBorderWidth,
        borderColor: isSelected ? theme.palette.themePrimary : 'transparent',
        borderStyle: 'solid',
        boxShadow: Depths.depth4,
        boxSizing: 'border-box',
        height: `calc(100% - ${theme.spacing.m})`,
        width: `calc(100% - ${getCommonHorizontalSpacer(theme)} * 2)`,
        marginTop: theme.spacing.s2,
        marginBottom: 'auto',
        borderRadius: `${topBorderRadius}px ${topBorderRadius}px 2px 2px`,
        overflow: 'visible',
        transitionDuration,
        transitionTimingFunction,
        cursor: 'pointer',
        selectors: {
          ':hover': {
            boxShadow: Depths.depth16,
            transform: 'translateY(-2px)'
          }
        }
      })
    ],
    innerRoot: [
      {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }
    ],
    topBar: [
      {
        width: `calc('100%' + 5px)`,
        backgroundColor: productColor,
        height: `calc(2*${theme.spacing.l2} - ${theme.spacing.s2})`,
        paddingLeft: theme.spacing.l1,
        borderWidth: `${itemBorderWidth}px ${itemBorderWidth}px 0 ${itemBorderWidth}px`,
        borderStyle: 'solid',
        borderRadius: `${topBorderRadius}px ${topBorderRadius}px 0 0`,
        borderColor: isSelected ? theme.palette.themePrimary : productColor,
        transitionDuration,
        transitionTimingFunction,
        margin: -itemBorderWidth,
        marginBottom: theme.spacing.l2
      }
    ],
    icon: [
      {
        top: `calc(${theme.spacing.l2} - ${theme.spacing.s2})`,
        height: `calc(2*${theme.spacing.l2})`,
        width: `calc(2*${theme.spacing.l2})`,
        display: 'block'
      }
    ],
    content: [
      {
        padding: `${theme.spacing.s1} ${theme.spacing.l1} 0  ${theme.spacing.l1}`,
        display: 'flex',
        flexDirection: 'column'
      }
    ],
    type: [
      {
        textTransform: 'uppercase',
        letterSpacing: '3.6px',
        color: theme.palette.neutralDark
      }
    ],
    title: [
      {
        fontWeight: FontWeights.semibold,
        lineHeight: FontSizes.xLarge,
        maxHeight: `calc(${FontSizes.xLarge}*3)`,
        overflow: 'hidden',
        color: theme.palette.themeDark,
        marginTop: theme.spacing.s1,
        paddingBottom: theme.spacing.m,
        boxSizing: 'border-box'
      }
    ],
    duration: [
      {
        color: theme.palette.neutralSecondary,
        marginBottom: theme.spacing.s1,
        marginTop: theme.spacing.s2
      }
    ],
    tag: [
      {
        marginRight: theme.spacing.s2,
        marginBottom: theme.spacing.s2,
        padding: `0 ${theme.spacing.s1}`,
        height: theme.spacing.l1,
        color: theme.palette.neutralDark,
        backgroundColor: theme.palette.neutralQuaternaryAlt,
        fontSize: FontSizes.small,
        borderRadius: 2,
        lineHeight: FontSizes.large,
        whiteSpace: 'nowrap',
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center'
      }
    ],
    footer: [
      {
        display: 'flex',
        justifySelf: 'flex-end',
        alignItems: 'center',
        justifyContent: 'space-between',
        margin: `0 ${theme.spacing.s2}`,
        borderTop: 'solid 1px',
        borderColor: theme.palette.neutralQuaternaryAlt,
        padding: theme.spacing.s1,
        paddingRight: 0,
        boxSizing: 'border-box'
      }
    ],
    learnMoreLink: [
      {
        fontSize: FontSizes.medium,
        fontWeight: FontWeights.semibold,
        selectors: {
          ':hover': {
            textDecoration: 'none'
          }
        }
      }
    ]
  };
};
export const MicrosoftLearnItem = styled(MicrosoftLearnItemInner, microsoftLearnItemStyles);
