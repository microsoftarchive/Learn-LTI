/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import React from 'react';
import { useStore } from '../../Stores/Core';
import { useObserver } from 'mobx-react-lite';
import { FilterType } from '../../Models/Learn/FilterType.model';
import { FilterTag, getDisplayFilterTags } from './MicrosoftLearnFilterUtils';
import { DefaultButton, styled } from '@fluentui/react';
import { IStylesOnly, IThemeOnlyProps, SimpleComponentStyles } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { themedClassNames } from '../../Core/Utils/FluentUI';

type FilterTagStyles = SimpleComponentStyles<'root' | 'tags'>;

const FilterTagsInner = ({ styles }: IStylesOnly<FilterTagStyles>): JSX.Element | null => {
  const { filterStore, catalog } = useStore('microsoftLearnStore');
  const classes = themedClassNames(styles);

  const handleClick = (tag: FilterTag) => {
    if (tag.type === FilterType.products) {
      let subItems: string[] = [...catalog?.products.values()]
        .filter(product => product.parentId && product.parentId === tag.id)
        .map(product => product.id);
      filterStore.removeFilter(tag.type, [...subItems, tag.id]);
    } else {
      filterStore.removeFilter(tag.type, [tag.id]);
    }
  }

  return useObserver(() => {
    let tags: FilterTag[] = getDisplayFilterTags(
      filterStore.displayFilter,
      filterStore.selectedFilter,
      filterStore.productMap,
      catalog
    );
    return (
      <div className={classes.root}>
        {tags.map(tag => (
          <DefaultButton
            className={classes.tags}
            iconProps={{ iconName: 'StatusCircleErrorX' }}
            text={tag.name}
            onClick={(event) => {
              event.preventDefault();
              handleClick(tag);
            }}
          />
        ))}
      </div>
    );
  });
};

const FilterTagStyles = ({ theme }: IThemeOnlyProps): FilterTagStyles => ({
  root: [
    {
      margin: `calc(${theme.spacing.s1} * 1.5)`,
      paddingLeft: theme.spacing.s1,
      paddingBottom: `calc(${theme.spacing.s1} * 2)`
    }
  ],
  tags: [
    {
      display: 'inline',
      backgroundColor: theme.palette.neutralLight,
      borderRadius: `calc(${theme.spacing.s2} * 0.5)`,
      marginRight: theme.spacing.s2,
      marginBottom: theme.spacing.s2,
      border: '0px',
      padding: `0px ${theme.spacing.s1}`,
      selectors: {
        '.ms-Button-flexContainer': {
          flexDirection: 'row-reverse'
        },
        '.ms-Icon': {
          fontWeight: 900
        }
      }
    }
  ]
});

export const MicrosoftLearnFilterTags = styled(FilterTagsInner, FilterTagStyles);
