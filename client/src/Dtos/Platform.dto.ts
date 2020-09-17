/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export interface PlatformDto {
  displayName: string;
  issuer: string;
  jwkSetUrl: string;
  accessTokenUrl: string;
  authorizationUrl: string;
  loginUrl: string;
  launchUrl: string;
  domainUrl: string;
  clientId: string;
  institutionName: string;
  logoUrl: string;
  publicKey: string;
  toolJwk: string;
  toolJwkSetUrl: string;
}
