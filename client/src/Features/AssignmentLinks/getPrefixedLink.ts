/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export const getPrefixedLink = (url: string): string => (!url.match(/^[a-zA-Z]+:\/\//) ? `https://${url}` : url);
