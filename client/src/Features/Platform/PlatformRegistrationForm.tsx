import React, { useEffect, useState } from 'react';
import { IThemeOnlyProps, SimpleComponentStyles, IStylesOnly } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { styled, ITheme, getTheme, FontSizes } from '@fluentui/react';
import { themedClassNames } from '../../Core/Utils/FluentUI';
import { platformRegistrationFieldGroups } from './PlatformRegistrationFields';
import { PlatformRegistrationGroup, PlatformRegistrationGroupStyles } from './PlatformRegistrationGroup';
import { InputGroupWrapperStyles } from '../../Core/Components/Common/InputGroupWrapper';
import { useObserver } from 'mobx-react-lite';
import { Platform } from '../../Models/Platform.model';
import { useStore } from '../../Stores/Core';

interface PlatformRegistrationFormProps {
  updatePlatformData: (data: Platform) => void;
}

type PlatformRegistrationFormStyles = SimpleComponentStyles<'root'>;
const PlatformRegistrationFormInner = ({
  styles,
  updatePlatformData
}: PlatformRegistrationFormProps & IStylesOnly<PlatformRegistrationFormStyles>): JSX.Element | null => {
  const classes = themedClassNames(styles);
  const platformStore = useStore('platformStore');
  const [platformData, setPlatformData] = useState<Platform | null>(platformStore.platform);

  useEffect(() => {
    if (!platformData) {
      return;
    }
    updatePlatformData(platformData);
  }, [platformData, updatePlatformData]);

  return useObserver(() => {
    return (
      <div className={classes.root}>
        {platformRegistrationFieldGroups.map((group, index) => {
          const groupStyle = platformRegistrationGroupStyles(getTheme(), index === 0);
          return (
            <PlatformRegistrationGroup
              registrationSettings={platformData}
              styles={groupStyle}
              inputGroupStyles={themedClassNames(inputGroupWrapperStyleProps)}
              title={group.name}
              fields={group.fields}
              key={group.name}
              setFieldValue={(newValue, fieldName) =>
                setPlatformData(prevState => (prevState ? { ...prevState, [fieldName]: newValue } : null))
              }
            />
          );
        })}
      </div>
    );
  });
};

const platformRegistrationFormStyles = ({ theme }: IThemeOnlyProps): PlatformRegistrationFormStyles => ({
  root: [
    {
      paddingLeft: theme.spacing.s1,
      alignSelf: 'stretch',
      display: 'grid',
      gridAutoFlow: 'row',
      gridTemplateColumns: 'auto 600px 1fr',
      overflowY: 'auto',
      flex: 1
    }
  ]
});

const platformRegistrationGroupStyles = (
  theme: ITheme,
  isFirst: boolean
): Partial<PlatformRegistrationGroupStyles> => ({
  title: {
    gridColumn: '1 / -1',
    marginTop: isFirst ? 0 : `calc(${theme.spacing.l1} * 2)`
  }
});

const inputGroupWrapperStyleProps = ({ theme }: IThemeOnlyProps): Partial<InputGroupWrapperStyles> => ({
  label: {
    gridColumn: '1',
    lineHeight: FontSizes.xLargePlus
  },
  childrenWrapper: {
    gridColumn: '2',
    marginBottom: `calc(${theme.spacing.l2} + ${theme.spacing.s2})`,
    minHeight: theme.spacing.l2
  }
});

export const PlatformRegistrationForm = styled(PlatformRegistrationFormInner, platformRegistrationFormStyles);
