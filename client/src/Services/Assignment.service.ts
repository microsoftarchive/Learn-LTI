/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { AssignmentDto } from '../Dtos/Assignment.dto';
import axios from 'axios';
import { safeData, WithError } from '../Core/Utils/Axios/safeData';

class AssignmentServiceClass {
  public async getAssignment(assignmentId: string): Promise<WithError<AssignmentDto>> {
    console.log('get assignment just assignment');
    console.log(assignmentId);
    const response = await axios.get<AssignmentDto>(
      `${process.env.REACT_APP_EDNA_ASSIGNMENT_SERVICE_URL}/assignments/${assignmentId}`
    );
    console.log('returnd assignment data, just assignment');
    console.log(response);
    return safeData(response);
  }

  public async updateAssignment(assignment: AssignmentDto): Promise<void> {
    axios.post(`${process.env.REACT_APP_EDNA_ASSIGNMENT_SERVICE_URL}/assignments`, assignment).catch(function (_error) {
      //TODO: YS handle errors
    });
  }

  public async changeAssignmentPublishStatus(assignmentId: string, newPublishStatus: boolean): Promise<boolean> {
    const serviceAction = newPublishStatus ? 'publish' : 'unpublish';
    await axios.post(
      `${process.env.REACT_APP_EDNA_ASSIGNMENT_SERVICE_URL}/assignments/${assignmentId}/${serviceAction}`
    );

    return true;
    // TODO: Handle errors
  }
}

export const AssignmentService = new AssignmentServiceClass();
