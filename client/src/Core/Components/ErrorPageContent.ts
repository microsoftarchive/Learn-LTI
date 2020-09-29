/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { ServiceError } from '../Utils/Axios/ServiceError';

export class ErrorPageContent {
  errorMsg : string | undefined = undefined;
  icon : string | undefined = undefined;

  static CreateFromServiceError( error : ServiceError ) : ErrorPageContent {
    switch (error) {
      case 'not found':     return {errorMsg : "Error 404. Page not found.", icon : "PageRemove"};
      case 'unauthorized':  return {errorMsg : "No sufficient permissions to view this page.", icon : "BlockedSiteSolid12"};
      default:              return {errorMsg : "Oops! Something went wrong.", icon : "Sad"};
    }  
  }
}