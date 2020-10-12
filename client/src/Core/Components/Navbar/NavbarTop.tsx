/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import React, { MouseEvent } from 'react';
import { INavLink } from 'office-ui-fabric-react/lib/Nav';
import { useObserver } from 'mobx-react-lite';
import { useHistory, useLocation } from 'react-router-dom';
import _ from 'lodash';
import { configurationRoutes, viewRoutes } from '../../../Router/RoutesConfiguration';
import { useStore } from '../../../Stores/Core';
import { styled, PivotItem, Pivot, IPivotStyles, FontWeights } from '@fluentui/react';
import { IThemeOnlyProps, IStylesOnly, SimpleComponentStyles } from '../../Utils/FluentUI/typings.fluent-ui';
import { Assignment } from '../../../Models/Assignment.model';
import { themedClassNames } from '../../Utils/FluentUI';
import { pagesDisplayNames } from '../../../Router/Consts';
import { FontSizes } from '@uifabric/fluent-theme';

type NavbarTopStyles = SimpleComponentStyles<'root'>;

const getNavLinks = (assignment: Assignment): INavLink[] => [
  ...(assignment.publishStatus === 'Published' ? 
    configurationRoutes.map(route => ({ ...route, disabled: true }))
    : configurationRoutes), 
  ...viewRoutes        
];

const removeSlashFromStringEnd = (initialString: string): string => initialString.replace(/\/$/, '');

const NavbarTopInner = ({ styles }: IStylesOnly<NavbarTopStyles>): JSX.Element | null => {
  const history = useHistory();
  const assignmentStore = useStore('assignmentStore');
  const location = useLocation();
  const { filterStore } = useStore('microsoftLearnStore');
  
  // The following map can be extended to include other searchParams as well in future in case need be
  let queryParamsMap = new Map<string, string>();
  queryParamsMap.set(pagesDisplayNames.MSLEARN, filterStore.learnFilterUriParam);   
  
  const handleLinkClick = (item?: PivotItem, event?: MouseEvent): void => {
    const pushToHistory = (item: PivotItem) => {
      if(item.props && item.props.itemKey && item.props.headerText) {
        const { itemKey, headerText } = item.props;
        const queryParam = queryParamsMap.get(headerText);
        queryParam && queryParam.length>0 ? history.push(`${itemKey}?${queryParam}`) : history.push(`${itemKey}`);
      }
    }

    event?.preventDefault();
    if(item){
      pushToHistory(item)
    }
  };
  
  const getMappedLinks = (assignment: Assignment): INavLink[] =>
  _.map(getNavLinks(assignment), link => {
    const assignmentId = assignment?.id;
    const url = assignmentId ? `/${assignmentId}${link.url}` : '/';
    return {...link,
      url: url,
      key: url,
      title: '',
    }
  });

  const selectedNavKey = removeSlashFromStringEnd(location.pathname);
  const classes = themedClassNames(styles);
    return useObserver(() => {
      if (!assignmentStore.assignment) {
        return null;
      }

      return (
        <div className={classes.root}>
          <Pivot
            selectedKey={selectedNavKey}
            onLinkClick={handleLinkClick}
            styles={themedClassNames(navStyles)}
          >
            {_.map(getMappedLinks(assignmentStore.assignment), link=>{
              return(            
                <PivotItem
                  headerText={link.name}
                  itemIcon={link.icon}    
                  itemKey={link.key} 
                  headerButtonProps={{disabled:link.disabled?link.disabled: false}}
              />)
            })}
          </Pivot>
        </div>
      )
    }
  )
}

const NavbarTopStyles = ({ theme }: IThemeOnlyProps): NavbarTopStyles => ({
  root: [
    {
      display: 'flex',
      height:`calc(${theme.spacing.l1} * 2.7)`,
      flexDirection: 'row',
      justifyContent: 'space-between',  
    }
  ]
});

const navStyles = ({ theme }: IThemeOnlyProps): Partial<IPivotStyles> => ({
  root: {
    width: `calc(${theme.spacing.l1} * 20.4)`,
    height:`calc(${theme.spacing.l1} * 2.6)`,
    backgroundColor: theme.palette.neutralLighterAlt,
    paddingTop: `calc(${theme.spacing.s1} * 1.25)`,
    selectors: {
      '.is-disabled':{
        color: theme.semanticColors.disabledText
      },
      '.is-selected':{
        fontSize: FontSizes.size16,
        fontWeight: FontWeights.semibold
      },
      '.ms-Pivot-icon  i, ':{
        fontFamily: 'FabricMDL2Icons, FabricMDL2Icons-1, FabricMDL2Icons-2',
        fontWeight: 'normal',
        fontStyle: 'normal'
      }
    }
  },
  link:{
    padding: '0px',
    marginRight: `calc(${theme.spacing.s1} * 2)`,
    fontSize: FontSizes.size16    
  }
})

export const NavbarTop = styled(NavbarTopInner, NavbarTopStyles);