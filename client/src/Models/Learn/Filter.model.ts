/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { FilterType } from "./FilterType.model";

export class Filter {
    products: string[];
    roles: string[];
    types: string[];
    levels: string[];
    terms: string[];

    constructor(){
        this.products=[];
        this.roles=[];
        this.types=[];
        this.levels=[];
        this.terms=[];
    }

    public get(type: FilterType): string[] {
        switch(type){
            case FilterType.products:
                return this.products;
            case FilterType.roles:
                return this.roles;
            case FilterType.levels:
                return this.levels;
            case FilterType.types:
                return this.types;
            case FilterType.terms:
                return this.terms;
        }
    }

    public set(type: FilterType, newValue: string[]): void {
        switch(type){
            case FilterType.products:
                this.products = newValue;
            case FilterType.roles:
                this.roles = newValue;
            case FilterType.levels:
                this.levels = newValue;
            case FilterType.types:
                this.types = newValue;
            case FilterType.terms:
                this.terms = newValue;
        }
    }
}