import { CatalogDto } from '../Dtos/Learn/Catalog.dto';
import axios from 'axios';
import { safeData, WithError } from '../Core/Utils/Axios/safeData';
import { AssignmentLearnContentDto } from '../Dtos/Learn/AssignmentLearnContent.dto';

class MicrosoftLearnServiceClass {
  public async getCatalog(): Promise<WithError<CatalogDto>> {
    const catalogApiResponse = await axios.get<CatalogDto>(`${process.env.REACT_APP_EDNA_LEARN_CONTENT}/learn-catalog`);
    return safeData(catalogApiResponse);
  }

  public async getAssignmentLearnContent(assignmentId: string): Promise<WithError<AssignmentLearnContentDto[]>> {
    const assignmentLearnContentResponse = await axios.get<AssignmentLearnContentDto[]>(
      `${process.env.REACT_APP_EDNA_LEARN_CONTENT}assignments/${assignmentId}/learn-content`
    );

    return safeData(assignmentLearnContentResponse);
  }

  public async saveAssignmentLearnContent(assignmentId: string, learnContentUid: string): Promise<void> {
    await axios.post(
      `${process.env.REACT_APP_EDNA_LEARN_CONTENT}assignments/${assignmentId}/learn-content/${learnContentUid}`
    );
  }

  public async removeAssignmentLearnContent(assignmentId: string, learnContentUid: string): Promise<void> {
    await axios.delete(
      `${process.env.REACT_APP_EDNA_LEARN_CONTENT}assignments/${assignmentId}/learn-content/${learnContentUid}`
    );
  }

  public async clearAssignmentLearnContent(assignmentId: string): Promise<void> {
    await axios.delete(`${process.env.REACT_APP_EDNA_LEARN_CONTENT}assignments/${assignmentId}/learn-content`);
  }
}

export const MicrosoftLearnService = new MicrosoftLearnServiceClass();
