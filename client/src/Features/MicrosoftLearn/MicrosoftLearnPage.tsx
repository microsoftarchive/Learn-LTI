import React, { useEffect, useState } from 'react';
import { useObserver } from 'mobx-react-lite';
import { useStore } from '../../Stores/Core';
import { MicrosoftLearnList } from './MicrosoftLearnList';
// import { PageWrapper } from '../../Core/Components/Common/PageWrapper';
import { themedClassNames } from '../../Core/Utils/FluentUI';
import { SimpleComponentStyles, IStylesOnly, IThemeOnlyProps } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { styled, Separator, mergeStyles } from '@fluentui/react';
import { MicrosoftLearnSearch, MicrosoftLearnSearchStyles } from './MicrosoftLearnSearch';
import {
  MicrosoftLearnSelectedItemsList,
  MicrosoftLearnSelectedItemsListStyles
} from './MicrosoftLearnSelectedItemsList';
import { getCommonSpacingStyle } from './MicrosoftLearnStyles';
import { MicrosoftLearnFilterPane } from './MicrosoftLearnFilterPane';
import { debounce } from 'lodash';
import { MicrosoftLearnFilterTags } from './MicrosoftLearnFilterTags';


type MicrosoftLearnPageStyles = SimpleComponentStyles<'root' | 'separator' | 'wrapper'>;

const MicrosoftLearnPageInner = ({ styles }: IStylesOnly<MicrosoftLearnPageStyles>): JSX.Element => {
  const learnStore = useStore('microsoftLearnStore');
  const learnFilterStore = useStore('microsoftLearnFilterStore');

  useEffect(() => {
    if (learnStore.catalog == null) {
      learnStore.initializeCatalog()
      .then(()=>{
        if(learnStore.catalog!==null){
          learnFilterStore.initializeFilters(learnStore.catalog);
        }
      })
    }
  }, [learnStore, learnFilterStore]);

  const classes = themedClassNames(styles);
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
      const debouncedHandleResize = debounce(function handleResize() {
          setWidth(window.innerWidth)
      }, 500)
      window.addEventListener('resize', debouncedHandleResize)
      return () => {
          window.removeEventListener('resize', debouncedHandleResize)        
      }
  })


  return useObserver(() => {

    if(width>768){
      return (
        <div className={classes.wrapper}>
          <MicrosoftLearnFilterPane /> 
          <div className={classes.root}>
          <MicrosoftLearnSearch styles={themedClassNames(microsoftLearnSearchStyles)} />
          <MicrosoftLearnSelectedItemsList styles={themedClassNames(microsoftLearnSelectedItemsStyles)} />
          <Separator className={classes.separator} />
          <MicrosoftLearnFilterTags />
          <MicrosoftLearnList />
        </div>
        </div>
      )
    }

    else{
      return(
        <div className={classes.wrapper}>
        <div className={classes.root}>
        <MicrosoftLearnSearch styles={themedClassNames(microsoftLearnSearchStyles)} />
        <MicrosoftLearnSelectedItemsList styles={themedClassNames(microsoftLearnSelectedItemsStyles)} />
        <Separator className={classes.separator} />
        <MicrosoftLearnFilterPane />         
        <MicrosoftLearnFilterTags />
        <MicrosoftLearnList />
      </div>
      </div>
      )
    }
  });
};

const microsoftLearnPageStyles = ({ theme }: IThemeOnlyProps): MicrosoftLearnPageStyles => ({
  root: [
    {
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    }
  ],
  separator: [
    mergeStyles(getCommonSpacingStyle(theme), {
      fontSize: 0,
      padding: 0,
      marginTop: theme.spacing.s1,
      marginBottom: `calc(${theme.spacing.l1}*0.5 + ${theme.spacing.s1})`,
      selectors: {
        '::before': {
          backgroundColor: theme.semanticColors.bodyDivider
        }
      }
    })
  ],
  wrapper: [
    {
      display:'flex', 
      flexDirection: 'row',
      marginTop: theme.spacing.l1
    }
  ]
});

const microsoftLearnSearchStyles = ({ theme }: IThemeOnlyProps): Partial<MicrosoftLearnSearchStyles> => ({
  root: [getCommonSpacingStyle(theme)]
});
const microsoftLearnSelectedItemsStyles = ({
  theme
}: IThemeOnlyProps): Partial<MicrosoftLearnSelectedItemsListStyles> => ({
  header: [getCommonSpacingStyle(theme)]
});
export const MicrosoftLearnPage = styled(MicrosoftLearnPageInner, microsoftLearnPageStyles);


