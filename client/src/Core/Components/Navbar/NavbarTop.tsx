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

type NavWrapperStyles = SimpleComponentStyles<'root'>;

const getNavLinks = (assignment: Assignment): INavLink[] => [
  ...(assignment.publishStatus === 'Published' ? 
    configurationRoutes.map(route => ({ ...route, disabled: true }))
    : configurationRoutes), 
  ...viewRoutes        
];

const removeSlashFromStringEnd = (initialString: string): string => initialString.replace(/\/$/, '');

const NavPivotInner = ({ styles }: IStylesOnly<NavWrapperStyles>): JSX.Element | null => {
  const history = useHistory();
  const assignmentStore = useStore('assignmentStore');
  const location = useLocation();
  
  // The following map can be extended to include other searchParams as well in future in case need be
  let uriSearchParamsMap = new Map<string, string>();
  uriSearchParamsMap.set(pagesDisplayNames.MSLEARN, ''); // replace empty string with store state
  
  const handleLinkClick = (item?: PivotItem, event?: MouseEvent): void => {
    event?.preventDefault();
    if (item && item.props.itemKey) {
      history.push(item.props.itemKey);
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
      search: uriSearchParamsMap.get(link.name)
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
              let urlWithSearchParams = link.url + 
                (link.search!==undefined && link.search.length>0 ? '?'+link.search : '')
              return(            
                <PivotItem
                  headerText={link.name}
                  itemIcon={link.icon}    
                  itemKey={urlWithSearchParams} 
                  headerButtonProps={{disabled:link.disabled?link.disabled: false}}
              />)
            })}
          </Pivot>
        </div>
      )
    }
  )
}

const NavWrapperStyles = ({ theme }: IThemeOnlyProps): NavWrapperStyles => ({
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
    paddingTop: '10px',
    selectors: {
      '.is-disabled':{
        color: theme.semanticColors.disabledText
      },
      '.is-selected':{
        fontSize: '16px',
        fontWeight: FontWeights.semibold
      }
    }
  },
  link:{
    padding: '0px',
    marginRight: `calc(${theme.spacing.s1}*2)`,
    fontSize: '16px',    
  }
})

export const NavbarTop = styled(NavPivotInner, NavWrapperStyles);