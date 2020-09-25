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
}