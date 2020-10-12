/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { observable, action } from 'mobx';
import { ChildStore } from './Core';
import { AssignmentService } from '../Services/Assignment.service';
import { Assignment } from '../Models/Assignment.model';
import { ErrorPageContent } from '../Core/Components/ErrorPageContent';
import _ from 'lodash';

export class AssignmentStore extends ChildStore {
  @observable assignment: Assignment | null = null;
  @observable isChangingPublishState: boolean | null = null;
  @observable errorContent : ErrorPageContent | undefined = undefined;
  @observable pushlishStatusChangeError: boolean = false;
  @observable syncedDescription: string | undefined;
  @observable syncedDeadline: Date | undefined;
  @observable serviceCallInProgress: number = 0;
  @observable isSynced: boolean | null = null;

  @action
  async initializeAssignment(assignmentId: string): Promise<void> {
    const assignment = await AssignmentService.getAssignment(assignmentId);
    if (assignment.error) {
      this.errorContent = ErrorPageContent.CreateFromServiceError(assignment.error);
      return;
    }
    const { deadline } = assignment;
    this.assignment = deadline ? { ...assignment, deadline: new Date(deadline) } : assignment;
    this.syncedDescription = assignment.description;
    this.syncedDeadline = assignment.deadline;
    this.isSynced = true;
  }

  @action
  updateAssignmentDeadline(newDeadline: Date): void {
    if (this.assignment) {
      this.assignment.deadline = newDeadline;
      this.serviceCallInProgress++;
      AssignmentService.updateAssignment(this.assignment)
      .then(hasErrors => {
        if(hasErrors === null)
        {
          this.syncedDeadline=newDeadline;
        }
        this.serviceCallInProgress--;
        this.isSynced=_.isEqual(this.syncedDeadline,this.assignment?.deadline);
      })
    }
  }

  @action
  updateAssignmentDescription(newDescription: string): void {
    if (this.assignment) {
      this.assignment.description = newDescription;
      this.serviceCallInProgress++;
      AssignmentService.updateAssignment(this.assignment)
      .then(hasErrors => {
        if(hasErrors === null)
        {
          this.syncedDescription=newDescription;
        }
        this.serviceCallInProgress--;
        this.isSynced=_.isEqual(this.syncedDescription,this.assignment?.description);
      })
    
    }
  }

  @action
  async changeAssignmentPublishStatus(newPublishStatus: boolean): Promise<void> {
    if (this.assignment) {
      this.isChangingPublishState = true;
      this.pushlishStatusChangeError = false;

      const hasError = await AssignmentService.changeAssignmentPublishStatus(
        this.assignment.id,
        newPublishStatus
      );
      if (hasError === null) {
        this.assignment.publishStatus = newPublishStatus ? 'Published' : 'NotPublished';
      } else {
        this.pushlishStatusChangeError = true;
      }
      this.isChangingPublishState = false;
    }
  }
}
