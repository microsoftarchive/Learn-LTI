import React from 'react';
import { IThemeOnlyProps, SimpleComponentStyles, IStylesOnly } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import {
  styled,
  Text,
  TextField,
  mergeStyleSets,
  FontWeights,
  getId,
  FontIcon,
  FontSizes,
  IconButton,
  mergeStyles,
  TooltipHost
} from '@fluentui/react';
import { themedClassNames } from '../../Core/Utils/FluentUI';
import { field } from './PlatformRegistrationFields';
import { textFieldBaseStyle } from '../../Core/Components/Common/Inputs/EdnaInputStyles';
import { InputGroupWrapper, InputGroupWrapperStyles } from '../../Core/Components/Common/InputGroupWrapper';
import { Platform } from '../../Models/Platform.model';

interface PlatformRegistrationGroupProps {
  title: string;
  fields: field[];
  registrationSettings: Platform | null;
  setFieldValue: (newValue: string, fieldName: keyof Platform) => void;
  inputGroupStyles: InputGroupWrapperStyles;
}
export type PlatformRegistrationGroupStyles = SimpleComponentStyles<
  'title' | 'fieldContent' | 'textField' | 'hidden' | 'infoIcon' | 'copyButton'
>;

const PlatformRegistrationGroupInner = ({
  title,
  fields,
  registrationSettings,
  setFieldValue,
  inputGroupStyles,
  styles
}: PlatformRegistrationGroupProps & IStylesOnly<PlatformRegistrationGroupStyles>): JSX.Element => {
  const classes = themedClassNames(styles);
  const combinedStyles = mergeStyleSets(themedClassNames(textFieldBaseStyle), themedClassNames(styles));

  return (
    <>
      <Text className={classes.title} variant="large">
        {title}
      </Text>
      {fields.map((field, index) => {
        const id = getId(field.fieldName);
        return (
          <InputGroupWrapper
            key={index}
            label={field.fieldLabel}
            styles={inputGroupStyles}
            labelElementId={id}
            required={field.isRequired}
          >
            <div className={classes.fieldContent}>
              <TooltipHost content={field.helpText} id={'tooltipId' + field.fieldName}>
                <FontIcon
                  iconName="Info"
                  className={mergeStyles(classes.infoIcon, !field.helpText && classes.hidden)}
                />
              </TooltipHost>
              <TextField
                id={id}
                value={registrationSettings ? registrationSettings[field.fieldName] : ''}
                resizable={false}
                onChange={(_e, newValue) => setFieldValue(newValue || '', field.fieldName)}
                className={combinedStyles.textField}
                {...field}
                errorMessage={
                  registrationSettings && !!registrationSettings[field.fieldName] ? '' : 'This field is required.'
                }
              />
              <IconButton
                tabIndex={-1}
                iconProps={{ iconName: 'Copy' }}
                onClick={() =>
                  navigator.clipboard.writeText(registrationSettings ? registrationSettings[field.fieldName] : '')
                }
                className={mergeStyles(classes.copyButton, !field.isCopyable && classes.hidden)}
              />
            </div>
          </InputGroupWrapper>
        );
      })}
    </>
  );
};

const platformRegistrationGroupStyles = ({ theme }: IThemeOnlyProps): PlatformRegistrationGroupStyles => ({
  title: [
    {
      color: theme.palette.neutralDark,
      fontWeight: FontWeights.semibold,
      marginBottom: theme.spacing.l1
    }
  ],
  fieldContent: [
    {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'baseline',
      flex: 1
    }
  ],
  textField: [
    {
      flex: 1
    }
  ],
  hidden: [
    {
      opacity: 0,
      pointerEvents: 'none'
    }
  ],
  infoIcon: [
    {
      marginRight: theme.spacing.l2,
      marginLeft: theme.spacing.l2,
      fontSize: FontSizes.medium,
      pointerEvents: 'none'
    }
  ],
  copyButton: [
    {
      fontSize: FontSizes.mediumPlus,
      color: theme.palette.black,
      marginLeft: theme.spacing.m,
      alignSelf: 'flex-start'
    }
  ]
});

export const PlatformRegistrationGroup = styled(PlatformRegistrationGroupInner, platformRegistrationGroupStyles);
