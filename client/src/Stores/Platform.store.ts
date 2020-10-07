/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { observable, action } from 'mobx';
import { ChildStore } from './Core';
import { PlatformService } from '../Services/Platform.service';
import { Platform } from '../Models/Platform.model';
import { ErrorPageContent } from '../Core/Components/ErrorPageContent';

export type PlatformSaveResult = 'error' | 'success';

export class PlatformStore extends ChildStore {
  @observable platform: Platform | null = null;
  @observable saveResult: PlatformSaveResult | null = null;
  @observable isSaving = false;
  @observable errorContent : ErrorPageContent | undefined = undefined;
  
  @action
  async initializePlatform(): Promise<void> {
    const platforms = await PlatformService.getAllPlatforms();

    if (platforms.error) {
      this.errorContent = ErrorPageContent.CreateFromServiceError(platforms.error);
    } else {
      if (platforms.length > 0) {
        this.platform = platforms[0];
      } else {
        const newPlatform = await PlatformService.getNewPlatform();

        if (!newPlatform.error) {
          this.platform = newPlatform;
        } else {
          this.errorContent = ErrorPageContent.CreateFromServiceError(newPlatform.error);
        }
      }
    }
  }

  @action
  async updatePlatform(platform: Platform): Promise<void> {
    this.platform = platform;
    this.saveResult = null;
    this.isSaving = true;
    const hasErrors = await PlatformService.updatePlatform(platform);
    this.isSaving = false;
    this.saveResult = hasErrors ? 'error' : 'success';
  }
}
