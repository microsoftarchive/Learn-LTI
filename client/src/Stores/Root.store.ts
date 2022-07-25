/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { ChildStore } from './Core/ChildStore';
import { AssignmentStore } from './Assignment.store';
import { UsersStore } from './Users.store';
import { AssignmentLinksStore } from './AssignmentLinks.store';
import { MicrosoftLearnStore } from './MicrosoftLearn.store';
import { PlatformStore } from './Platform.store';

export class RootStore {
  assignmentStore = new AssignmentStore();
  usersStore = new UsersStore();
  assignmentLinksStore = new AssignmentLinksStore();
  microsoftLearnStore = new MicrosoftLearnStore();
  platformStore = new PlatformStore();

  constructor() {
    //Get list of all available stores
    const childStores: ChildStore[] = Object.keys(this)
      .map(key => Reflect.get(this, key))
      .filter(value => value instanceof ChildStore);

    //Set the Root store for each store in the list to be this RootStore and initialize the stores.
    childStores.forEach(store => store.setRootStore(this));
    childStores.forEach(store => store.initialize());
  }
}
