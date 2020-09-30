import {
  FontSizes,
  FontWeights,
  ITheme,
  IStyle,
  IDatePickerStyles,
  mergeStyles,
  ITextFieldStyles,
  ICheckboxStyles
} from '@fluentui/react';
import { IThemeOnlyProps } from '../../../Utils/FluentUI/typings.fluent-ui';

export const getEdnaInputStyleBase = (theme: ITheme): IStyle => {
  return {
    selectors: {
      '& .ms-TextField-wrapper': {
        display: 'flex'
      },
      '& .ms-Label': {
        marginRight: theme.spacing.l2,
        color: theme.palette.neutralPrimary,
        fontSize: FontSizes.medium,
        lineHeight: FontSizes.mediumPlus,
        fontWeight: FontWeights.regular
      },
      '& ::placeholder': {
        fontStyle: 'italic'
      }
    }
  };
};

export const datePickerBaseStyle = ({ theme }: IThemeOnlyProps): Partial<IDatePickerStyles> => {
  const baseStyle = getEdnaInputStyleBase(theme);
  return {
    textField: baseStyle
  };
};

export const textFieldBaseStyle = ({ theme }: IThemeOnlyProps): Partial<ITextFieldStyles> => {
  const baseStyle = getEdnaInputStyleBase(theme);
  const textFieldWrapperStyle: IStyle = {
    selectors: {
      '& .ms-TextField-fieldGroup': {
        width: '100%'
      }
    }
  };

  return {
    root: [mergeStyles(baseStyle, textFieldWrapperStyle)]
  };
};

export const inputLabelStyle = ({ theme }: IThemeOnlyProps): IStyle => ({
  color: theme.palette.neutralPrimary,
  fontSize: FontSizes.medium,
  lineHeight: FontSizes.mediumPlus,
  fontWeight: FontWeights.regular
});

export const checkBoxStyle = ({ theme }: IThemeOnlyProps): Partial<ICheckboxStyles> => {
  return {
    root: [
      {
        selectors: {
          '&.is-checked': {
            selectors: {
              '.ms-Checkbox-checkbox': {
                borderWidth: 0
              }
            }
          }
        }
      }
    ],
    checkbox: [
      {
        borderColor: theme.palette.neutralTertiaryAlt,
        borderWidth: 2,
        width: `calc(${theme.spacing.l1} + ${theme.spacing.s2})`,
        height: `calc(${theme.spacing.l1} + ${theme.spacing.s2})`,
        borderRadius: theme.spacing.m
      }
    ]
  };
};
