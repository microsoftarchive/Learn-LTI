/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

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
  @observable syncedAssignmentLinks: AssignmentLink[] = [];
  @observable serviceCallInProgress: number = 0;
  @observable isSynced: boolean | null = null;

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
        this.syncedAssignmentLinks=links;
        this.isSynced=true;
        this.isLoading = false;
      });

    toObservable(() => this.root.assignmentStore.assignment?.publishStatus)
      .subscribe(publishStatus => {
        if(publishStatus==='Published'){
          this.assignmentLinks = this.syncedAssignmentLinks
          this.isSynced = true;          
        }
      })
  }

  @action
  addAssignmentLink(assignmentLink: AssignmentLink): void {
    this.assignmentLinks = [...this.assignmentLinks, assignmentLink];
    const assignmentId = this.root.assignmentStore.assignment!.id;

    this.serviceCallInProgress++; 
    AssignmentLinksService.updateAssignmentLink(assignmentLink, assignmentId)
    .then(hasErrors => {
    if(hasErrors === null)
    {
      this.syncedAssignmentLinks = [...this.syncedAssignmentLinks, assignmentLink];
    }
    this.serviceCallInProgress--; 
    this.isSynced = _.isEqual(this.assignmentLinks, this.syncedAssignmentLinks);  
  })
  }

  @action
  editAssignmentLink(editedLink: AssignmentLink): void {
    const updatedLinks = this.assignmentLinks.map(link => (link.id === editedLink.id ? editedLink : link));
    const assignmentId = this.root.assignmentStore.assignment!.id;
    this.assignmentLinks = updatedLinks;

    this.serviceCallInProgress++; 
    AssignmentLinksService.updateAssignmentLink(editedLink, assignmentId)
    .then(hasErrors => {
    if(hasErrors === null)
    {
      this.syncedAssignmentLinks = this.syncedAssignmentLinks.map(link => (link.id === editedLink.id ? editedLink : link));
    }
    this.serviceCallInProgress--; 
    this.isSynced = _.isEqual(this.assignmentLinks, this.syncedAssignmentLinks);
  })
  }

  @action
  deleteAssignmentLink(assignmentLinkId: string): void {
    this.syncedAssignmentLinks = this.assignmentLinks;
    const updatedLinks = _.filter(this.assignmentLinks, link => link.id !== assignmentLinkId);
    const assignmentId = this.root.assignmentStore.assignment!.id;
    this.assignmentLinks = updatedLinks;

    this.serviceCallInProgress++; 
    AssignmentLinksService.deleteAssignmentLink(assignmentLinkId, assignmentId)
    .then(hasErrors => {
    if(hasErrors === null)
    {
      this.syncedAssignmentLinks = _.filter(this.syncedAssignmentLinks, link => link.id !== assignmentLinkId);
    }
    this.serviceCallInProgress--; 
    this.isSynced = _.isEqual(this.assignmentLinks, this.syncedAssignmentLinks);
  })
  }
}
