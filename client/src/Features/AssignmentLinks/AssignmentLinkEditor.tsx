import React from 'react';
import { IThemeOnlyProps, SimpleComponentStyles, IStylesOnly } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { styled, TextField, mergeStyleSets, ITextFieldStyles, IProcessedStyleSet } from '@fluentui/react';
import { themedClassNames } from '../../Core/Utils/FluentUI';
import { AssignmentLink } from '../../Models/AssignmentLink.model';
import { textFieldBaseStyle } from '../../Core/Components/Common/Inputs/EdnaInputStyles';

export type editableLinkFields = 'displayText' | 'url' | 'description';
interface AssignmentLinkEditorProps {
  link: AssignmentLink;
  onChangeTextField: (field: editableLinkFields, newValue: string) => void;
  linkTextFieldId?: string;
}
export type AssignmentLinkEditorStyles = SimpleComponentStyles<'root'>;

const AssignmentLinkEditorInner = ({
  styles,
  link,
  onChangeTextField,
  linkTextFieldId
}: AssignmentLinkEditorProps & IStylesOnly<AssignmentLinkEditorStyles>): JSX.Element => {
  const classes = themedClassNames(styles);

  return (
    <div className={classes.root}>
      <TextField
        id={linkTextFieldId}
        placeholder="Text to display"
        value={link?.displayText || ''}
        styles={themedClassNames(textFieldBaseStyle)}
        onChange={(_e, newValue) => onChangeTextField('displayText', newValue || '')}
      />
      <TextField
        value={link?.url || ''}
        placeholder="URL"
        styles={themedClassNames(urlInputStyle)}
        onChange={(_e, newValue) => onChangeTextField('url', newValue || '')}
      />
      <TextField
        value={link?.description || ''}
        placeholder="Link Description"
        styles={themedClassNames(descriptionInputStyle)}
        multiline
        resizable={false}
        onChange={(_e, newValue) => onChangeTextField('description', newValue || '')}
      />
    </div>
  );
};

const styles = ({ theme }: IThemeOnlyProps): AssignmentLinkEditorStyles => {
  return {
    root: [
      {
        display: 'grid',
        gridRowGap: theme.spacing.l1,
        marginBottom: theme.spacing.l2
      }
    ]
  };
};

const urlInputStyle = ({ theme }: IThemeOnlyProps): IProcessedStyleSet<Partial<ITextFieldStyles>> =>
  mergeStyleSets(
    {
      field: [
        {
          color: theme.palette.themePrimary,
          fontStyle: 'italic'
        }
      ]
    },
    textFieldBaseStyle
  );
const descriptionInputStyle = ({ theme }: IThemeOnlyProps): IProcessedStyleSet<Partial<ITextFieldStyles>> =>
  mergeStyleSets(
    {
      fieldGroup: [
        {
          minHeight: `calc(${theme.spacing.l2} + ${theme.spacing.m})`,
          height: `calc(${theme.spacing.l2} + ${theme.spacing.m})`
        }
      ]
    },
    textFieldBaseStyle
  );

export const AssignmentLinkEditor = styled(AssignmentLinkEditorInner, styles);
