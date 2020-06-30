import { observable, action } from 'mobx';
import _ from 'lodash';
import { ChildStore } from './Core';
import { AssignmentLink } from '../Models/AssignmentLink.model';
import { AssignmentLinksService } from '../Services/AssignmentLinks.service';
import { toObservable } from '../Core/Utils/Mobx/toObservable';
import { switchMap, filter, map } from 'rxjs/operators';
import { AssignmentLinkDto } from '../Dtos/AssignmentLink.dto';

export class AssignmentLinksStore extends ChildStore {
  @observable assignmentLinks: AssignmentLink[] = [];
  @observable isLoading = true;

  initialize(): void {
    toObservable(() => this.root.assignmentStore.assignment)
      .pipe(filter(assignment => !assignment))
      .subscribe(() => (this.assignmentLinks = []));

    toObservable(() => this.root.assignmentStore.assignment)
      .pipe(
        filter(assignment => !!assignment),
        map(assignment => assignment!.id),
        switchMap(AssignmentLinksService.getAssignmentLinks),
        filter(links => !links.error),
        map(links => links as AssignmentLinkDto[])
      )
      .subscribe((links: AssignmentLinkDto[]) => {
        this.assignmentLinks = links;
        this.isLoading = false;
      });
  }

  @action
  addAssignmentLink(assignmentLink: AssignmentLink): void {
    this.assignmentLinks = [...this.assignmentLinks, assignmentLink];
    const assignmentId = this.root.assignmentStore.assignment!.id;

    AssignmentLinksService.updateAssignmentLink(assignmentLink, assignmentId);
  }

  @action
  editAssignmentLink(editedLink: AssignmentLink): void {
    const updatedLinks = this.assignmentLinks.map(link => (link.id === editedLink.id ? editedLink : link));

    const assignmentId = this.root.assignmentStore.assignment!.id;

    this.assignmentLinks = updatedLinks;
    AssignmentLinksService.updateAssignmentLink(editedLink, assignmentId);
  }

  @action
  deleteAssignmentLink(assignmentLinkId: string): void {
    const updatedLinks = _.filter(this.assignmentLinks, link => link.id !== assignmentLinkId);
    const assignmentId = this.root.assignmentStore.assignment!.id;

    this.assignmentLinks = updatedLinks;
    AssignmentLinksService.deleteAssignmentLink(assignmentLinkId, assignmentId);
  }
}
