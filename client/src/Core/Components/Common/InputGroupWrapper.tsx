import React, { PropsWithChildren } from 'react';
import { IThemeOnlyProps, SimpleComponentStyles, IStylesOnly } from '../../Utils/FluentUI/typings.fluent-ui';
import { styled, Label, mergeStyles } from '@fluentui/react';
import { themedClassNames } from '../../Utils/FluentUI';
import { inputLabelStyle } from './Inputs/EdnaInputStyles';

interface InputGroupWrapperProps {
  label: string;
  labelElementId?: string;
  required?: boolean;
}

export type InputGroupWrapperStyles = SimpleComponentStyles<'childrenWrapper' | 'label'>;

const InputGroupWrapperInner = ({
  children,
  styles,
  label,
  required,
  labelElementId
}: PropsWithChildren<InputGroupWrapperProps> & IStylesOnly<InputGroupWrapperStyles>): JSX.Element => {
  const classes = themedClassNames(styles);
  return (
    <>
      {label && (
        <Label className={classes.label} htmlFor={labelElementId} required={required}>
          {label}
        </Label>
      )}
      <div className={classes.childrenWrapper}>{children}</div>
    </>
  );
};

const inputGroupWrapperStyles = ({ theme }: IThemeOnlyProps): InputGroupWrapperStyles => ({
  childrenWrapper: [{}],
  label: [
    mergeStyles(inputLabelStyle({ theme }), {
      alignSelf: 'flex-start',
      whiteSpace: 'nowrap',
      selectors: {
        '::after': {
          color: theme.palette.neutralDark
        }
      }
    })
  ]
});

export const InputGroupWrapper = styled(InputGroupWrapperInner, inputGroupWrapperStyles);
