import React, { MouseEvent } from 'react';
import { INavLink } from 'office-ui-fabric-react/lib/Nav';
import { useObserver } from 'mobx-react-lite';
import { useHistory, useLocation } from 'react-router-dom';
import _ from 'lodash';
import { configurationRoutes, viewRoutes } from '../../../Router/RoutesConfiguration';
import { useStore } from '../../../Stores/Core';
import { styled, PivotItem, Pivot, IPivotStyles, MessageBarType, AnimationClassNames, mergeStyles, Separator, FontWeights } from '@fluentui/react';
import { IThemeOnlyProps, IStylesOnly, SimpleComponentStyles } from '../../Utils/FluentUI/typings.fluent-ui';
import { Assignment } from '../../../Models/Assignment.model';
import { PublishControlArea } from '../../../Features/PublishAssignment/PublishControlArea';
import { themedClassNames } from '../../Utils/FluentUI';
import { AutohideMessageBar } from '../AutohideMessageBar';
import { pagesDisplayNames } from '../../../Router/Consts';

type NavWrapperStyles = SimpleComponentStyles<'root'  | 'navArea' | 'messageBar' | 'separator'>;

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
          <div className={classes.navArea}>
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
            <PublishControlArea />            
          </div>
          <Separator className={classes.separator} />
          {assignmentStore.assignment && (
            <AutohideMessageBar
              messageBarType={MessageBarType.success}
              isMultiline={false}
              className={classes.messageBar}
              showMessageBar={
                assignmentStore.assignment.publishStatus === 'Published' && assignmentStore.isChangingPublishState === false
              }
            >
              Your assignment was published successfully
            </AutohideMessageBar>
          )}
        </div>
      )
    }
  )
}

const NavWrapperStyles = ({ theme }: IThemeOnlyProps): NavWrapperStyles => ({
  root: [
    {
      display:'block',
      backgroundColor: theme.palette.neutralLighterAlt,
      paddingLeft: `calc(${theme.spacing.l1} * 1.6)`,
      paddingRight: `calc(${theme.spacing.l1} * 1.6)`,   

    }
  ],
  navArea:[
    {
      display: 'flex',
      height:`calc(${theme.spacing.l1} * 2.7)`,
      flexDirection: 'row',
      justifyContent: 'space-between',  
    }
  ],
  messageBar: [
    mergeStyles(AnimationClassNames.fadeIn200, {
      height: theme.spacing.l2,
      width: 'auto',
      marginLeft: 'auto',
      marginTop: `calc(${theme.spacing.s1}*1.6)`
    })
  ],
  separator: [
    {
      height: '1px',
      backgroundColor: '#E1DFDD',
      padding: `0px 0px`
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

export const NavPivot = styled(NavPivotInner, NavWrapperStyles);