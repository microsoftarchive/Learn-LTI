/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { PlatformDto } from '../Dtos/Platform.dto';
import axios from 'axios';
import { safeData, getServiceError, WithError } from '../Core/Utils/Axios/safeData';
import { ServiceError } from '../Core/Utils/Axios/ServiceError';

class PlatformServiceClass {
  public async getAllPlatforms(): Promise<WithError<PlatformDto[]>> {
    const allPlatformsResponse = await axios.get<PlatformDto[]>(
      `${process.env.REACT_APP_EDNA_PLATFORM_SERVICE_URL}/platforms`
    );

    return safeData(allPlatformsResponse);
  }

  public async getNewPlatform(): Promise<WithError<PlatformDto>> {
    const newPlatformResponse = await axios.get<PlatformDto>(
      `${process.env.REACT_APP_EDNA_PLATFORM_SERVICE_URL}/new-platform`
    );

    return safeData(newPlatformResponse);
  }

  public async updatePlatform(platformSettings: PlatformDto): Promise<ServiceError | null> {
    const updatePlatformResponse = await axios.post(
      `${process.env.REACT_APP_EDNA_PLATFORM_SERVICE_URL}/platforms`,
      platformSettings
    );

    return getServiceError(updatePlatformResponse);
  }
}

export const PlatformService = new PlatformServiceClass();
