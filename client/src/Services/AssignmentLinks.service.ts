/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { AssignmentLinkDto } from '../Dtos/AssignmentLink.dto';
import axios from 'axios';
import { safeData, WithError } from '../Core/Utils/Axios/safeData';

class AssignmentLinksServiceClass {
  public async getAssignmentLinks(assignmentId: string): Promise<WithError<AssignmentLinkDto[]>> {
    const response = await axios.get<AssignmentLinkDto[]>(
      `${process.env.REACT_APP_EDNA_LINKS_SERVICE_URL}/assignments/${assignmentId}/links`
    );

    return safeData(response);
  }

  public async updateAssignmentLink(assignmentLink: AssignmentLinkDto, assignmentId: string): Promise<void> {
    await axios.post(
      `${process.env.REACT_APP_EDNA_LINKS_SERVICE_URL}/assignments/${assignmentId}/links/${assignmentLink.id}`,
      assignmentLink
    );
    //TODO: YS handle errors
  }

  public async deleteAssignmentLink(assignmentLinkId: string, assignmentId: string): Promise<void> {
    await axios.delete(
      `${process.env.REACT_APP_EDNA_LINKS_SERVICE_URL}/assignments/${assignmentId}/links/${assignmentLinkId}`
    );

    //TODO: YS handle errors
  }
}

export const AssignmentLinksService = new AssignmentLinksServiceClass();
