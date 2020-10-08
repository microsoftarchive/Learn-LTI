/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { AssignmentLinkDto } from '../Dtos/AssignmentLink.dto';
import axios from 'axios';
import { getServiceError, safeData, WithError } from '../Core/Utils/Axios/safeData';
import { ServiceError } from '../Core/Utils/Axios/ServiceError';

class AssignmentLinksServiceClass {
  public async getAssignmentLinks(assignmentId: string): Promise<WithError<AssignmentLinkDto[]>> {
    const response = await axios.get<AssignmentLinkDto[]>(
      `${process.env.REACT_APP_EDNA_LINKS_SERVICE_URL}/assignments/${assignmentId}/links`
    );

    return safeData(response);
  }

  public async updateAssignmentLink(assignmentLink: AssignmentLinkDto, assignmentId: string): Promise<ServiceError | null> {
    const response = await axios.post(
      `${process.env.REACT_APP_EDNA_LINKS_SERVICE_URL}/assignments/${assignmentId}/links/${assignmentLink.id}`,
      assignmentLink
    );
    return getServiceError(response);
    //TODO: YS handle errors
  }

  public async deleteAssignmentLink(assignmentLinkId: string, assignmentId: string): Promise<ServiceError | null> {
    const response = await axios.delete(
      `${process.env.REACT_APP_EDNA_LINKS_SERVICE_URL}/assignments/${assignmentId}/links/${assignmentLinkId}`
    );
    return getServiceError(response);
    //TODO: YS handle errors
  }
}

export const AssignmentLinksService = new AssignmentLinksServiceClass();
