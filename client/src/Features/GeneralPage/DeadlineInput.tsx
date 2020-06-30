import React, { useState } from 'react';
import { IThemeOnlyProps, IStylesOnly } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { styled, DatePicker, mergeStyleSets, IDatePickerStyles } from '@fluentui/react';
import { themedClassNames } from '../../Core/Utils/FluentUI';
import moment from 'moment';
import { InputGroupWrapper } from '../../Core/Components/Common/InputGroupWrapper';
import { generalPageInputGroupChildrenStyleProps } from './GeneralPageStyles';
import { datePickerBaseStyle } from '../../Core/Components/Common/Inputs/EdnaInputStyles';
import { useStore } from '../../Stores/Core';

type DeadlineInputStyles = Partial<IDatePickerStyles>;

const DeadlineInputInner = ({ styles }: IStylesOnly<DeadlineInputStyles>): JSX.Element => {
  const assignmentStore = useStore('assignmentStore');
  const [deadline, setDeadline] = useState<Date | null>(assignmentStore.assignment?.deadline || null);

  const updateDeadline = (newValue?: Date | null): void => {
    if (newValue) {
      setDeadline(newValue);
      assignmentStore.updateAssignmentDeadline(newValue);
    }
  };

  const combinedStyles = mergeStyleSets(themedClassNames(datePickerBaseStyle), themedClassNames(styles));

  const formatDate = (chosenDate?: Date): string => {
    return chosenDate ? moment(chosenDate).format('MMM DD YYYY') : '';
  };
  return (
    <InputGroupWrapper styles={generalPageInputGroupChildrenStyleProps} label="Deadline">
      <DatePicker
        styles={combinedStyles}
        formatDate={formatDate}
        placeholder="Select"
        showGoToToday={false}
        onSelectDate={updateDeadline}
        minDate={new Date()}
        value={deadline || undefined}
      />
    </InputGroupWrapper>
  );
};

const deadlineInputStyles = ({ theme }: IThemeOnlyProps): DeadlineInputStyles => ({
  root: [
    {
      minWidth: 180,
      marginBottom: theme.spacing.l2
    }
  ]
});

export const DeadlineInput = styled(DeadlineInputInner, deadlineInputStyles);
