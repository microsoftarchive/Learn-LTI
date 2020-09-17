/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { LearnType, Product } from '../../Models/Learn';

const microsoftColor = '#0078d4';

const colorMapping: { [key: string]: string } = {
  azure: microsoftColor,
  vs: '#5c2d91',
  dotnet: '#512bd4',
  m365: microsoftColor,
  dynamics: '#008272',
  'ms-graph': microsoftColor,
  'power-platform': '#3C3C41',
  'sql-server': microsoftColor,
  windows: microsoftColor,
  office: '#D83B01'
};

export const getProductColor = (product?: Product): string => {
  const defaultColor = '#243A5E';
  if (!product) {
    return defaultColor;
  }

  return colorMapping[product.parentId || product.id] || defaultColor;
};

export const getTypeText = (type: LearnType): string => {
  const typeStrings: { [key: string]: string } = {
    module: 'module',
    learningPath: 'learning path'
  };

  return typeStrings[type] || type;
};

export const getProductText = (product?: Product): string => {
  return product?.name || '';
};

export const getProductAncestor = (productDetails: Product, productsCatalog?: Map<string, Product>): Product => {
  if (!productDetails.parentId || !productsCatalog || productDetails.parentId === productDetails.id) {
    return productDetails;
  }
  const productCatalogDetails = productsCatalog.get(productDetails.parentId || '');
  if (productCatalogDetails) {
    return getProductAncestor(productCatalogDetails, productsCatalog);
  }
  return productDetails;
};

export const getDurationText = (durationInSeconds: number): string => {
  const hourDuration = Math.floor(durationInSeconds / 60);
  const minutesRemainderDuration = durationInSeconds % 60;
  return `${hourDuration ? hourDuration + ' hr ' : ''}${
    minutesRemainderDuration ? minutesRemainderDuration + ' min ' : ''
  }`;
};
