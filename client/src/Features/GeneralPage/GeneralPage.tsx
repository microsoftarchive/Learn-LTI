/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import React from 'react';
import { IThemeOnlyProps, SimpleComponentStyles, IStylesOnly } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { styled, Separator } from '@fluentui/react';
import { themedClassNames } from '../../Core/Utils/FluentUI';
import { PageWrapper, PageWrapperStyles } from '../../Core/Components/Common/PageWrapper';
import { LinksCreatorInput } from './LinksCreatorInput';
import { DeadlineInput } from './DeadlineInput';
import { DescriptionInput } from './DescriptionInput';
import { generalPageAreaStyle } from './GeneralPageStyles';
import { GeneralPageCreatedLinks } from './GeneralPageCreatedLinks';
import { pagesDisplayNames } from '../../Router/Consts';

type GeneralPageStyles = SimpleComponentStyles<'mainEditArea' | 'separator'>;

const GeneralPageInner = ({ styles }: IStylesOnly<GeneralPageStyles>): JSX.Element => {
  const classes = themedClassNames(styles);

  return (
    <PageWrapper title={pagesDisplayNames.GENERAL} styles={pageWrapperStyles}>
      <div className={classes.mainEditArea}>
        <DescriptionInput />
        <DeadlineInput />
        <Separator className={classes.separator} />
        <LinksCreatorInput />
      </div>
      <GeneralPageCreatedLinks />
    </PageWrapper>
  );
};

const generalPageStyles = ({ theme }: IThemeOnlyProps): GeneralPageStyles => {
  return {
    mainEditArea: [generalPageAreaStyle],
    separator: [
      {
        gridColumn: '1 / -1',
        selectors: {
          '::before': {
            backgroundColor: theme.semanticColors.bodyDivider
          }
        }
      }
    ]
  };
};

const pageWrapperStyles = (): Partial<PageWrapperStyles> => ({
  content: [
    {
      paddingLeft: 0,
      paddingRight: 0
    }
  ]
});

export const GeneralPage = styled(GeneralPageInner, generalPageStyles);
