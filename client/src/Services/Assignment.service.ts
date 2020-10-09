/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { AssignmentDto } from '../Dtos/Assignment.dto';
import axios from 'axios';
import { getServiceError, safeData, WithError } from '../Core/Utils/Axios/safeData';
import { ServiceError } from '../Core/Utils/Axios/ServiceError';

class AssignmentServiceClass {
  public async getAssignment(assignmentId: string): Promise<WithError<AssignmentDto>> {
    const response = await axios.get<AssignmentDto>(
      `${process.env.REACT_APP_EDNA_ASSIGNMENT_SERVICE_URL}/assignments/${assignmentId}`
    );

    return safeData(response);
  }

  public async updateAssignment(assignment: AssignmentDto): Promise<void> {
    axios.post(`${process.env.REACT_APP_EDNA_ASSIGNMENT_SERVICE_URL}/assignments`, assignment).catch(function (_error) {
      //TODO: YS handle errors
    });
  }

  public async changeAssignmentPublishStatus(assignmentId: string, newPublishStatus: boolean): Promise<ServiceError | null> {
    const serviceAction = newPublishStatus ? 'publish' : 'unpublish';
    const response = await axios.post(
      `${process.env.REACT_APP_EDNA_ASSIGNMENT_SERVICE_URL}/assignments/${assignmentId}/${serviceAction}`
    );

    return getServiceError(response);
    // TODO: Handle errors
  }
}

export const AssignmentService = new AssignmentServiceClass();
