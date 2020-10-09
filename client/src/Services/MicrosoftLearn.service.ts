/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { CatalogDto } from '../Dtos/Learn/Catalog.dto';
import axios from 'axios';
import { safeData, WithError, getServiceError } from '../Core/Utils/Axios/safeData';
import { AssignmentLearnContentDto } from '../Dtos/Learn/AssignmentLearnContent.dto';
import { ServiceError } from '../Core/Utils/Axios/ServiceError';

class MicrosoftLearnServiceClass {
  public async getCatalog(): Promise<WithError<CatalogDto>> {
    const catalogApiResponse = await axios.get<CatalogDto>(`${process.env.REACT_APP_EDNA_LEARN_CONTENT}/learn-catalog`);
    return safeData(catalogApiResponse);
  }

  public async getAssignmentLearnContent(assignmentId: string): Promise<WithError<AssignmentLearnContentDto[]>> {
    const assignmentLearnContentResponse = await axios.get<AssignmentLearnContentDto[]>(
      `${process.env.REACT_APP_EDNA_LEARN_CONTENT}/assignments/${assignmentId}/learn-content`
    );
    return safeData(assignmentLearnContentResponse);
  }

  public async saveAssignmentLearnContent(assignmentId: string, learnContentUid: string): Promise<ServiceError | null> {
    const assignmentLearnServiceresponse = await axios.post(
      `${process.env.REACT_APP_EDNA_LEARN_CONTENT}/assignments/${assignmentId}/learn-content/${learnContentUid}`
    );
    return getServiceError(assignmentLearnServiceresponse);
  }

  public async removeAssignmentLearnContent(assignmentId: string, learnContentUid: string): Promise<ServiceError | null> {
    const assignmentLearnServiceresponse = await axios.delete(
      `${process.env.REACT_APP_EDNA_LEARN_CONTENT}/assignments/${assignmentId}/learn-content/${learnContentUid}`
    );
    return getServiceError(assignmentLearnServiceresponse);
  }

  public async clearAssignmentLearnContent(assignmentId: string): Promise<ServiceError | null> {
    const assignmentLearnServiceresponse = await axios.delete(
      `${process.env.REACT_APP_EDNA_LEARN_CONTENT}/assignments/${assignmentId}/learn-content`
    );
    return getServiceError(assignmentLearnServiceresponse);
  }
}

export const MicrosoftLearnService = new MicrosoftLearnServiceClass();
