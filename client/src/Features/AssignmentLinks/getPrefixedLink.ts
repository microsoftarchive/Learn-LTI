/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

export const getPrefixedLink = (url: string): string => (!url.match(/^[a-zA-Z]+:\/\//) ? `https://${url}` : url);
