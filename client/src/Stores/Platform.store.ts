import { observable, action } from 'mobx';
import { ChildStore } from './Core';
import { PlatformService } from '../Services/Platform.service';
import { Platform } from '../Models/Platform.model';
import { ErrorPageBody } from '../Core/Components/ErrorPagebody';

export type PlatformSaveResult = 'error' | 'success';

export class PlatformStore extends ChildStore {
  @observable platform: Platform | null = null;
  @observable saveResult: PlatformSaveResult | null = null;
  @observable isSaving = false;
  @observable errorBody: ErrorPageBody = { errorMsg : undefined, icon : undefined};

  @action
  async initializePlatform(): Promise<void> {
    const platforms = await PlatformService.getAllPlatforms();

    if (platforms.error) {
      switch (platforms.error) {
        case 'not found': 
          this.errorBody.errorMsg = "Error 404. Page not found.";
          this.errorBody.icon = "PageRemove";
          break;
        case 'unauthorized': 
          this.errorBody.errorMsg = "No sufficient permissions to view this page.";
          this.errorBody.icon = "BlockedSiteSolid12";
          break;
        default: 
          this.errorBody.errorMsg = "Oops! Something went wrong!";
          this.errorBody.icon = "Sad";
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
