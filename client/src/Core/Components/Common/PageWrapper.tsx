import React, { PropsWithChildren } from 'react';
import { SimpleComponentStyles, IStylesOnly, IThemeOnlyProps } from '../../Utils/FluentUI/typings.fluent-ui';
import { styled, Text, FontSizes } from '@fluentui/react';
import { themedClassNames } from '../../Utils/FluentUI';

interface PageWrapperProps {
  title: string;
}
export type PageWrapperStyles = SimpleComponentStyles<'root' | 'title' | 'content'>;

const PageWrapperInner = ({
  styles,
  title,
  children
}: PropsWithChildren<PageWrapperProps> & IStylesOnly<PageWrapperStyles>): JSX.Element => {
  const classes = themedClassNames(styles);

  return (
    <div className={classes.root}>
      <Text variant="xLargePlus" className={classes.title}>
        {title}
      </Text>
      <div className={classes.content}>{children}</div>
    </div>
  );
};

const pageWrapperStyles = ({ theme }: IThemeOnlyProps): PageWrapperStyles => ({
  root: [
    {
      height: 'max-content',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      width: '100%',
      flex: 1,
      overflow: 'visible'
    }
  ],
  title: [
    {
      color: theme.palette.neutralPrimary,
      lineHeight: FontSizes.xxLarge,
      marginTop: `calc(${theme.spacing.l1} + ${theme.spacing.s1})`
    }
  ],
  content: [
    {
      flex: 1,
      backgroundColor: theme.palette.white,
      padding: `calc(2*${theme.spacing.l1})`,
      border: `1px solid ${theme.palette.neutralLight}`,
      marginTop: theme.spacing.m,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'visible'
    }
  ]
});

export const PageWrapper = styled(PageWrapperInner, pageWrapperStyles);
