import { observable, action } from 'mobx';
import { ChildStore } from './Core';
import { PlatformService } from '../Services/Platform.service';
import { Platform } from '../Models/Platform.model';

export type PlatformSaveResult = 'error' | 'success';

export class PlatformStore extends ChildStore {
  @observable platform: Platform | null = null;
  @observable saveResult: PlatformSaveResult | null = null;
  @observable isSaving = false;
  @observable isNotAuthorized = false;
  @observable responseStatus = "ok";

  @action
  async initializePlatform(): Promise<void> {
    const platforms = await PlatformService.getAllPlatforms();

    if (platforms.error) {
      if (platforms.error === 'unauthorized') {
        this.isNotAuthorized = true;
      }
      else{
        this.responseStatus=platforms.error;
      }
    } else {
      if (platforms.length > 0) {
        this.platform = platforms[0];
      } else {
        const newPlatform = await PlatformService.getNewPlatform();

        if (!newPlatform.error) {
          this.platform = newPlatform;
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
