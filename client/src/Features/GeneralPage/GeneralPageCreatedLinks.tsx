import React from 'react';
import { IThemeOnlyProps, SimpleComponentStyles, IStylesOnly } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { styled, mergeStyles } from '@fluentui/react';
import { themedClassNames } from '../../Core/Utils/FluentUI';
import { useStore } from '../../Stores/Core';
import { AssignmentLinksList, AssignmentLinksListStyles } from '../AssignmentLinks/AssignmentLinksList';
import { generalPageAreaStyle } from './GeneralPageStyles';
import { useObserver } from 'mobx-react-lite';

export type GeneralPageCreatedLinksStyles = SimpleComponentStyles<'root'>;

const GeneralPageCreatedLinksInner = ({ styles }: IStylesOnly<GeneralPageCreatedLinksStyles>): JSX.Element | null => {
  const classes = themedClassNames(styles);
  const assignmentLinksStore = useStore('assignmentLinksStore');

  return useObserver((): JSX.Element | null => {
    if (assignmentLinksStore.assignmentLinks.length === 0 && !assignmentLinksStore.isLoading) {
      return null;
    }
    return (
      <div className={classes.root}>
        <AssignmentLinksList styles={assignmentLinksListStyles} />
      </div>
    );
  });
};
const generalPageCreatedLinksStyles = ({ theme }: IThemeOnlyProps): GeneralPageCreatedLinksStyles => ({
  root: [
    mergeStyles(generalPageAreaStyle, {
      backgroundColor: theme.semanticColors.infoBackground,
      borderColor: theme.palette.neutralTertiaryAlt,
      borderWidth: '1px 0',
      borderStyle: 'solid'
    })
  ]
});

const assignmentLinksListStyles: Partial<AssignmentLinksListStyles> = {
  root: [
    {
      gridColumn: '2'
    }
  ]
};
export const GeneralPageCreatedLinks = styled(GeneralPageCreatedLinksInner, generalPageCreatedLinksStyles);
