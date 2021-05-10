/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import React, { useState } from 'react';
import { IThemeOnlyProps, IStylesOnly } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { styled, getId, ITextFieldStyles, mergeStyleSets, TextField } from '@fluentui/react';
import { InputGroupWrapper } from '../../Core/Components/Common/InputGroupWrapper';
import { generalPageInputGroupChildrenStyleProps } from './GeneralPageStyles';
import { themedClassNames } from '../../Core/Utils/FluentUI';
import { textFieldBaseStyle } from '../../Core/Components/Common/Inputs/EdnaInputStyles';
import { useStore } from '../../Stores/Core';

type DescriptionInputStyles = Partial<ITextFieldStyles>;

const ValidateDescLength = (text: string | undefined) =>
  text && text.length > 2500 ? 'The entered text is too long.' : '';

const DescriptionInputInner = ({ styles }: IStylesOnly<DescriptionInputStyles>): JSX.Element => {
  const assignmentStore = useStore('assignmentStore');
  const [description, setDescription] = useState(assignmentStore.assignment?.description || '');

  const descriptionFieldId: string = getId('description');

  const combinedStyles = mergeStyleSets(themedClassNames(textFieldBaseStyle), themedClassNames(styles));

  return (
    <InputGroupWrapper
      label="Description"
      labelElementId={descriptionFieldId}
      styles={generalPageInputGroupChildrenStyleProps}
    >
      <TextField
        value={description}
        id={descriptionFieldId}
        multiline
        resizable={false}
        styles={combinedStyles}
        placeholder="Insert here the description of the pathway for your students"
        onBlur={() => assignmentStore.updateAssignmentDescription(description)}
        onChange={(_e, newValue) => setDescription(newValue || '')}
        onGetErrorMessage={ValidateDescLength}
      />
    </InputGroupWrapper>
  );
};

const descriptionInputStyles = ({ theme }: IThemeOnlyProps): DescriptionInputStyles => ({
  field: [
    {
      height: 100
    }
  ]
});

export const DescriptionInput = styled(DescriptionInputInner, descriptionInputStyles);
