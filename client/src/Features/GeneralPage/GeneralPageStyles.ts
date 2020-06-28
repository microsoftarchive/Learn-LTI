import { InputGroupWrapperStyles } from '../../Core/Components/Common/InputGroupWrapper';
import { getTheme, IStyle } from '@fluentui/react';

const theme = getTheme();

export const generalPageInputGroupChildrenStyleProps: InputGroupWrapperStyles = {
  childrenWrapper: {
    gridColumn: '2'
  },
  label: {
    gridColumn: '1',
    marginLeft: theme.spacing.l2,
    marginRight: theme.spacing.l1
  }
};

export const generalPageAreaStyle: IStyle = {
  display: 'grid',
  gridAutoFlow: 'row',
  gridTemplateColumns: '170px 1fr 165px'
};
