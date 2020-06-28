import React from 'react';
import { IThemeOnlyProps, SimpleComponentStyles, IStylesOnly } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { styled, PrimaryButton } from '@fluentui/react';
import { themedClassNames } from '../../Core/Utils/FluentUI';

interface PlatformControlAreaProps {
  savePlatformSettings: () => void;
  canSave: boolean;
}
export type PlatformControlAreaStyles = SimpleComponentStyles<'root' | 'saveButton'>;

const PlatformControlAreaInner = ({
  savePlatformSettings,
  canSave,
  styles
}: PlatformControlAreaProps & IStylesOnly<PlatformControlAreaStyles>): JSX.Element => {
  const classes = themedClassNames(styles);

  return (
    <div className={classes.root}>
      <PrimaryButton
        onClick={savePlatformSettings}
        text="Save Registration"
        className={classes.saveButton}
        disabled={!canSave}
      />
    </div>
  );
};

const PlatformControlAreaStyles = ({ theme }: IThemeOnlyProps): PlatformControlAreaStyles => ({
  root: [
    {
      padding: `${theme.spacing.l1} 0`,
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
      width: '100%'
    }
  ],

  saveButton: [
    {
      alignSelf: 'flex-end',
      textTransform: 'uppercase'
    }
  ]
});

export const PlatformControlArea = styled(PlatformControlAreaInner, PlatformControlAreaStyles);
