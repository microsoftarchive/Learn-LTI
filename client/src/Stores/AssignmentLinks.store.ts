/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { observable, action, computed } from 'mobx';
import _ from 'lodash';
import { ChildStore } from './Core';
import { AssignmentLink } from '../Models/AssignmentLink.model';
import { AssignmentLinksService } from '../Services/AssignmentLinks.service';
import { toObservable } from '../Core/Utils/Mobx/toObservable';
import { switchMap, filter, map } from 'rxjs/operators';
import { AssignmentLinkDto } from '../Dtos/AssignmentLink.dto';
import { ServiceError } from '../Core/Utils/Axios/ServiceError';
import { WithError } from '../Core/Utils/Axios/safeData';

export class AssignmentLinksStore extends ChildStore {
  @observable assignmentLinks: AssignmentLink[] = [];
  @observable isLoading = true;
  @observable syncedAssignmentLinks: AssignmentLink[] = [];
  @observable serviceCallInProgress: number = 0;
  @observable hasServiceError: ServiceError | null = null;
  @observable addOrUpdateCallInProgress: string[] = []; 

  @computed get isSynced(): boolean {
    return _.differenceBy(this.assignmentLinks, this.syncedAssignmentLinks, 'id').length === 0; 
  }  

  initialize(): void {
    toObservable(() => this.root.assignmentStore.assignment)
      .pipe(filter(assignment => !assignment))
      .subscribe(() => (this.assignmentLinks = []));

    const getLinks =  async (assignmentId : string) : Promise<WithError<AssignmentLinkDto[]>> =>
    {
      const links = await AssignmentLinksService.getAssignmentLinks(assignmentId);
      if(links.error) {
        this.hasServiceError = links.error;
      }
      return links;
    }

    toObservable(() => this.root.assignmentStore.assignment)
      .pipe(
        filter(assignment => !!assignment),
        map(assignment => assignment!.id),
        switchMap(getLinks),
        filter(links => !links.error),
        map(links => links as AssignmentLinkDto[])
      )
      .subscribe((links: AssignmentLinkDto[]) => {
        this.assignmentLinks = links;
        this.syncedAssignmentLinks=links;
        this.isLoading = false;
      });

    toObservable(() => this.root.assignmentStore.assignment?.publishStatus)
      .subscribe(publishStatus => {
        if(publishStatus==='Published'){
          this.assignmentLinks = this.syncedAssignmentLinks
        }
      })
    
    toObservable(() => this.serviceCallInProgress)
      .subscribe(serviceCallInProgress => {
        if(serviceCallInProgress===0 && this.root.assignmentStore.assignment?.publishStatus==='Published'){
          this.assignmentLinks = this.syncedAssignmentLinks
        }
      })
  }

  @action
  addAssignmentLink(assignmentLink: AssignmentLink): void {
    this.serviceCallInProgress++; 
    this.assignmentLinks = [...this.assignmentLinks, assignmentLink];
    const assignmentId = this.root.assignmentStore.assignment!.id;
    this.addOrUpdateCallInProgress.push(assignmentLink.id)

    AssignmentLinksService.updateAssignmentLink(assignmentLink, assignmentId)
    .then(hasErrors => {
    if(hasErrors === null) {
      this.syncedAssignmentLinks = [...this.syncedAssignmentLinks, assignmentLink];
    } else {
      this.hasServiceError = hasErrors;
    }
    this.addOrUpdateCallInProgress = this.addOrUpdateCallInProgress.filter(linkId=>linkId!==assignmentLink.id)
    this.serviceCallInProgress--; 
  })
  }

  @action
  editAssignmentLink(editedLink: AssignmentLink): void {
    this.serviceCallInProgress++; 
    const updatedLinks = this.assignmentLinks.map(link => (link.id === editedLink.id ? editedLink : link));
    const assignmentId = this.root.assignmentStore.assignment!.id;
    this.assignmentLinks = updatedLinks;
    this.addOrUpdateCallInProgress.push(editedLink.id);

    AssignmentLinksService.updateAssignmentLink(editedLink, assignmentId)
    .then(hasErrors => {
    if(hasErrors === null) {
      this.syncedAssignmentLinks = this.syncedAssignmentLinks.map(link => (link.id === editedLink.id ? editedLink : link));
    } else {
      this.hasServiceError = hasErrors;
    }
    this.addOrUpdateCallInProgress = this.addOrUpdateCallInProgress.filter(linkId=>linkId!==editedLink.id);
    this.serviceCallInProgress--; 
  })
  }

  @action
  deleteAssignmentLink(assignmentLinkId: string): void {
    this.serviceCallInProgress++; 
    const updatedLinks = _.filter(this.assignmentLinks, link => link.id !== assignmentLinkId);
    const assignmentId = this.root.assignmentStore.assignment!.id;
    this.assignmentLinks = updatedLinks;

    AssignmentLinksService.deleteAssignmentLink(assignmentLinkId, assignmentId)
    .then(hasErrors => {
    if(hasErrors === null) {
      this.syncedAssignmentLinks = _.filter(this.syncedAssignmentLinks, link => link.id !== assignmentLinkId);
    } else {
      this.hasServiceError = hasErrors;
    }
    this.serviceCallInProgress--; 
  })
  }
}
