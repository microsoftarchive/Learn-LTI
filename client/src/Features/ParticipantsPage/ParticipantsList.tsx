/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import React, { useEffect } from 'react';
import { SimpleComponentStyles, IStylesOnly } from '../../Core/Utils/FluentUI/typings.fluent-ui';
import {
  styled,
  SelectionMode,
  IColumn,
  DetailsListLayoutMode,
  ShimmeredDetailsList,
  IDetailsListStyles,
  Link
} from '@fluentui/react';
import { themedClassNames } from '../../Core/Utils/FluentUI';
import { useStore } from '../../Stores/Core';
import { useObserver } from 'mobx-react-lite';
import { User } from '../../Models/User.model';

function participantsColumns(): IColumn[] {
  const commonColumnProps = {
    minWidth: 160,
    isPadded: true
  };

  const emailField = (item: User): JSX.Element => (
    <Link href={`mailto:${item.email}`} target="_blank" rel="noopener noreferrer">
      {item.email}
    </Link>
  );

  const columns: IColumn[] = [
    {
      ...commonColumnProps,
      key: 'Name',
      name: 'Name',
      fieldName: 'displayName'
    },
    {
      ...commonColumnProps,
      key: 'Email',
      name: 'Email',
      fieldName: 'email',
      onRender: emailField
    },
    {
      ...commonColumnProps,
      key: 'Role',
      name: 'Role',
      fieldName: 'roleDisplayName'
    }
  ];
  return columns;
}

type ParticipantsListStyles = SimpleComponentStyles<'root'>;

const ParticipantsListInner = ({ styles }: IStylesOnly<ParticipantsListStyles>): JSX.Element => {
  const usersStore = useStore('usersStore');

  useEffect(() => {
    if (usersStore.participants == null) {
      usersStore.initializeParticipants();
    }
  }, [usersStore]);

  const columns: IColumn[] = participantsColumns();

  return useObserver(() => (
    <ShimmeredDetailsList
      items={usersStore.participants || []}
      compact={false}
      columns={columns}
      selectionMode={SelectionMode.none}
      layoutMode={DetailsListLayoutMode.fixedColumns}
      isHeaderVisible={true}
      enableShimmer={!usersStore.participants}
      detailsListStyles={themedClassNames(styles)}
    />
  ));
};

const participantsListStyles = (): Partial<IDetailsListStyles> => ({
  headerWrapper: [
    {
      selectors: {
        '.ms-DetailsHeader': {
          paddingTop: 0
        }
      }
    }
  ]
});

export const ParticipantsList = styled(ParticipantsListInner, participantsListStyles);
