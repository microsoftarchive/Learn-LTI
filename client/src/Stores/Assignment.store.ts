import { observable, action } from 'mobx';
import { ChildStore } from './Core';
import { AssignmentService } from '../Services/Assignment.service';
import { Assignment } from '../Models/Assignment.model';
import { ErrorPageBody } from '../Core/Components/ErrorPagebody';

export class AssignmentStore extends ChildStore {
  @observable assignment: Assignment | null = null;
  @observable isChangingPublishState: boolean | null = null;
  @observable errorBody: ErrorPageBody = { errorMsg : undefined, icon : undefined};

  @action
  async initializeAssignment(assignmentId: string): Promise<void> {
    const assignment = await AssignmentService.getAssignment(assignmentId);
    if (assignment.error) {
      switch (assignment.error) {
        case 'not found': 
          this.errorBody.errorMsg = "Error 404. Page not found.";
          this.errorBody.icon = "PageRemove";
          break;
        default: 
          this.errorBody.errorMsg = "Oops! Something went wrong!";
          this.errorBody.icon = "Sad";
      }
      return;
    }
    const { deadline } = assignment;
    this.assignment = deadline ? { ...assignment, deadline: new Date(deadline) } : assignment;
  }

  @action
  updateAssignmentDeadline(newDeadline: Date): void {
    if (this.assignment) {
      this.assignment.deadline = newDeadline;
      AssignmentService.updateAssignment(this.assignment);
    }
  }

  @action
  updateAssignmentDescription(newDescription: string): void {
    if (this.assignment) {
      this.assignment.description = newDescription;
      AssignmentService.updateAssignment(this.assignment);
    }
  }

  @action
  async changeAssignmentPublishStatus(newPublishStatus: boolean): Promise<void> {
    if (this.assignment) {
      this.isChangingPublishState = true;
      const isStatusChanged = await AssignmentService.changeAssignmentPublishStatus(
        this.assignment.id,
        newPublishStatus
      );
      if (isStatusChanged) {
        this.assignment.publishStatus = newPublishStatus ? 'Published' : 'NotPublished';
      }
      this.isChangingPublishState = false;
    }
  }
}
