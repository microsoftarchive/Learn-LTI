import { observable, action } from 'mobx';
import { ChildStore } from './Core';
import { PlatformService } from '../Services/Platform.service';
import { Platform } from '../Models/Platform.model';
import { ErrorPageContent } from '../Core/Components/ErrorPageContent';
import { ServiceError } from '../Core/Utils/Axios/ServiceError';

export type PlatformSaveResult = 'error' | 'success';

export class PlatformStore extends ChildStore {
  @observable platform: Platform | null = null;
  @observable saveResult: PlatformSaveResult | null = null;
  @observable isSaving = false;
  @observable errorContent : ErrorPageContent | undefined = undefined;

  getErrorContent (error : ServiceError) : void {
    switch (error) {
      case 'not found':
        this.errorContent = {errorMsg : "Error 404. Page not found.", icon : "PageRemove"}
        break;
      case 'unauthorized': 
        this.errorContent = {errorMsg : "No sufficient permissions to view this page.", icon : "BlockedSiteSolid12"}
        break;
      default: 
        this.errorContent = {errorMsg : "Oops! Something went wrong.", icon : "Sad"};
    }
  }
  
  @action
  async initializePlatform(): Promise<void> {
    const platforms = await PlatformService.getAllPlatforms();

    if (platforms.error) {
      this.getErrorContent(platforms.error);
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
