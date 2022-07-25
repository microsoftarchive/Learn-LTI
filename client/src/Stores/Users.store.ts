/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { action, observable } from 'mobx';
import { ChildStore } from './Core';
import { UsersService } from '../Services/Users.service';
import { toObservable } from '../Core/Utils/Mobx/toObservable';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { race } from 'rxjs';
import { User } from '../Models/User.model';
import { UserRole } from '../Models/UserRole.model';
import { UserDto } from '../Dtos/User.dto';
import _ from 'lodash';
import { AppAuthConfig } from '../Core/Auth/AppAuthConfig';
import { Account } from 'msal';
import { AccountInfo } from '@azure/msal-browser';
import { WithError } from '../Core/Utils/Axios/safeData';
import { ErrorPageContent } from '../Core/Components/ErrorPageContent';

export class UsersStore extends ChildStore {
  private readonly roleIdToRoleDisplayName: Map<UserRole, string> = new Map<UserRole, string>([
    ['learner', 'Learner'],
    ['teacher', 'Teacher'],
    ['admin', 'Admin']
  ]);

  @observable userDetails: User | null = null;
  @observable userImageUrl = '';
  @observable participants: User[] | null = null;
  @observable account: Account | null = null;
  @observable errorContent: ErrorPageContent | undefined = undefined;

  initialize(): void {
    const detailsFromPlatform = toObservable(
      () => this.root.platformStore.platform || this.root.platformStore.errorContent !== undefined
    ).pipe(
      filter(platformObservable => !!platformObservable),
      map(() => AppAuthConfig.getAllAccounts()?.[0]),
      filter(account => !!account),
      filter(account => !!account?.name),
      map(account => account!),
      map(account => this.accountToUserModel(account))
    );

    const getUser = async (assignmentId: string): Promise<WithError<UserDto>> => {
      const user = await UsersService.getCurrentUserDetails(assignmentId);
      if (user.error) {
        this.errorContent = ErrorPageContent.CreateFromServiceError(user.error);
      } else if (!user) {
        this.errorContent = { errorMsg: 'You are not enrolled in this course.', icon: 'BlockContact' };
      } else if (!user.givenName && !user.familyName) {
        this.errorContent = { errorMsg: 'Please add a name for the user.', icon: 'BlockContact' };
      }
      return user;
    };
    const detailsFromAssignment = toObservable(() => this.root.assignmentStore.assignment).pipe(
      filter(assignment => !!assignment),
      map(assignment => assignment!.id),
      switchMap(getUser),
      filter(user => !user.error),
      map(user => user as UserDto),
      filter(user => !!user?.givenName || !!user?.familyName),
      map(user => this.userDtoToModel(user))
    );

    race(detailsFromAssignment, detailsFromPlatform)
      .pipe(
        tap(user => (this.userDetails = user)),
        switchMap(() => UsersService.getCurrentUserImageBlob()),
        map(imageBlob => URL.createObjectURL(imageBlob))
      )
      .subscribe(imageUrl => (this.userImageUrl = imageUrl));
  }

  @action
  async initializeParticipants(): Promise<void> {
    const assignmentId = this.root.assignmentStore.assignment!.id;
    const participants = await UsersService.getAllParticipantsDetails(assignmentId);
    if (participants.error) {
      return;
    }

    this.participants = _.sortBy(
      participants.map(user => this.userDtoToModel(user)),
      'role',
      'familyName'
    );
  }

  private userDtoToModel(userDto: UserDto): User {
    const displayName =
      userDto.givenName || userDto.familyName
        ? `${userDto.givenName ? userDto.givenName + ' ' : ''}${userDto.familyName || ''}`
        : '';
    console.log(displayName);
    return {
      roleDisplayName: this.roleIdToRoleDisplayName.get(userDto.role)!,
      displayName,
      ...userDto
    };
  }
  private accountToUserModel(account: AccountInfo): User {
    return {
      roleDisplayName: '',
      displayName: account?.name || '',
      email: account?.username || ''
    };
  }
}
