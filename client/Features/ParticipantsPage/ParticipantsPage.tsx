import React from 'react';
import { SimpleComponentStyles, IStylesOnly } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import { styled } from '@fluentui/react';
import { PageWrapper } from '../../Core/Components/Common/PageWrapper';
import { ParticipantsList } from './ParticipantsList';
import { themedClassNames } from '../../Core/Utils/FluentUI';
import { pagesDisplayNames } from '../../Router/Consts';

type ParticipantsPageStyles = SimpleComponentStyles<'root'>;

const ParticipantsPageInner = ({ styles }: IStylesOnly<ParticipantsPageStyles>): JSX.Element => {
  const classes = themedClassNames(styles);

  return (
    <PageWrapper title={pagesDisplayNames.PARTICIPANTS}>
      <div className={classes.root}>
        <ParticipantsList />
      </div>
    </PageWrapper>
  );
};

const participantsPageStyles = (): ParticipantsPageStyles => ({
  root: [{}]
});

export const ParticipantsPage = styled(ParticipantsPageInner, participantsPageStyles);
