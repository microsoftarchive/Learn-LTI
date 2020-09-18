/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

type FilterFlags<Base, Condition> = {
  [Key in keyof Base]: Base[Key] extends Condition ? Key : never;
};

type AllowedNames<Base, Condition> = FilterFlags<Base, Condition>[keyof Base];

type PickAll<PickType> = Pick<PickType, keyof PickType>;
