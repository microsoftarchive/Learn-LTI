import { Product, Role, Level, Catalog } from '../../Models/Learn';
import { FilterType } from '../../Models/Learn/FilterType.model'; 
import { LearnTypeFilterOption, FilterOption } from './MicrosoftLearnFilterComponentProps';
import _ from 'lodash';

const FilterOptionComparer = (a: FilterOption, b: FilterOption) => {
    if(a && b){
        return a.name.localeCompare(b.name);
    }
    else if(a){
        return 1;
    }
    return -1;
}

export const getProductsToDisplay = (productId: string[] | undefined, productMap: Map<string, Product> | undefined) => {
    let products: Product[] = [];
    let productParentChildMap = new Map<Product, Product[]>();
    if(productMap!=null){
        products = [...productMap.values()].filter(product => productId?.includes(product.id))
        const parentProducts = products.filter(item => item && item?.parentId==null).sort(FilterOptionComparer);
        let included: Product[] = [];
        parentProducts.forEach((parent) => {
                let children = products.filter(product=> product?.parentId && product.parentId===parent?.id);                
                productParentChildMap.set(parent, children);
                included = [...included, ...children, parent]
        })

        products.filter(item => !included.includes(item))
                .forEach(p=>{
                    if(p.id===p.parentId){
                        productParentChildMap.set(p, []);
                    }
                });

        let sortedProductParentChildMap = new Map<Product, Product[]>();
        [...productParentChildMap.keys()]
        .sort(FilterOptionComparer)
        .forEach((item)=>{
            let val = productParentChildMap.get(item)?.sort(FilterOptionComparer)            
            sortedProductParentChildMap.set(item, val? val : []);
        })
        productParentChildMap = sortedProductParentChildMap;
    }
    return productParentChildMap;
}

export const getRolesToDisplay = (roleId: string[] | undefined, roleMap: Map<string, Role> |undefined) =>{
    let roles = new Map<Role, Role[]>();
    if(roleMap!=null){
        roleId?.forEach((rid)=>{
            let role = roleMap.get(rid);
            if(role){
                roles.set(role, []);
            }            
        });
        let sortedRoles = new Map<Role, Role[]>();
        [...roles.keys()].sort(FilterOptionComparer)
            .forEach((item)=>{
            sortedRoles.set(item, []);
        })
        roles = sortedRoles;    
    }
    return roles;
}

export const getLevelsToDisplay = (levelId:  string[] | undefined, levelMap: Map<string, Level> | undefined) => {
    let levels = new Map<Level, Level[]>();
    if(levelMap!=null){
        levelId?.forEach((lid)=>{
            let level = levelMap.get(lid); 
            if(level){
                levels.set(level, []);
            }
        })
        let sortedLevels = new Map<Level, Level[]>();
        [...levels.keys()].sort(FilterOptionComparer)
        .forEach((item) =>{
            sortedLevels.set(item, []);
        });
        levels = sortedLevels;
    }
    return levels;
}

export const getTypesToDisplay = (typeId: string[] | undefined) =>{
    let types = new Map<LearnTypeFilterOption, LearnTypeFilterOption[]>();
    const t1: LearnTypeFilterOption =  { id:'module', name:'Module' };
    const t2: LearnTypeFilterOption = { id:'learningPath', name:'Learning Path' };

    typeId?.forEach((tid)=>{
        switch(tid){
            case 'module':     
                types.set(t1, []); break;
            case 'learningPath':
                types.set(t2, []); break;
        }                
        })
    
    let sortedTypes = new Map<LearnTypeFilterOption, LearnTypeFilterOption[]>();
    [...types.keys()].sort(FilterOptionComparer)
    .forEach((item)=>{
        sortedTypes.set(item, []);
    })
    return sortedTypes;  
}

export type FilterTag = { id: string, name: string, type: FilterType }

export const getDisplayFilterTags = (displayFilters: Map<FilterType, string[]>, selectedFilters: Map<FilterType, string[]>, productsMap: Map<Product, Product[]>, learnCatalog: Catalog | null) => {

    const getIntersection = (type: FilterType) => {
        let intersect = displayFilters.get(type)?.filter(item => selectedFilters.get(type)?.includes(item));
        if(type===FilterType.Product){
            let parentTags = [...productsMap.keys()].filter(key => intersect?.includes(key.id));
            let childrenTags = _.flatten(parentTags.map(parent => productsMap.get(parent))).map(child => child?.id);
            intersect = intersect?.filter(item => !childrenTags.includes(item));
        }
        return intersect;
    }
    const getTags = (_map: Map<string, FilterOption> | undefined, _type: FilterType) => {
        let _tags: FilterTag[] = []
        let _filters = getIntersection(_type);
        if(_map?.values()){
           _tags = [..._map.values()].filter(item => _filters?.includes(item.id))
                                     .map(item => ({id: item.id, name: item.name, type: _type}));
        }
        return _tags;
    }

    let productTags: FilterTag[] = getTags(learnCatalog?.products, FilterType.Product)                                                                                                                    
    let roleTags: FilterTag[] = getTags(learnCatalog?.roles, FilterType.Role);
    let levelTags: FilterTag[] = getTags(learnCatalog?.levels, FilterType.Level);

    let typeFilters = getIntersection(FilterType.Type)?.filter(item => item!!);
    let typeTags: FilterTag[] = []
    if(typeFilters){
         let _typeTags = typeFilters?.map(typeId => {
            switch(typeId){
                case 'module':
                    return { id: typeId, name: 'Module', type: FilterType.Type }
                case 'learningPath':
                    return { id: typeId, name: 'Learning Path', type: FilterType.Type }
                default:
                    return { id: '', name: '', type: FilterType.Type }
            }
        })        
        typeTags = _typeTags? _typeTags.filter(item => item.id.length>0) : []; 
    }
    return  [...productTags, ...roleTags, ...levelTags, ...typeTags]
}

export const getRegexs = (searchTerm: string): RegExp[] => {
    const expressions: RegExp[] = searchTerm
                                 .trim().replace(/\s+/g, ' ').split(' ').map(termPart => new RegExp(`.*${termPart}.*`, 'i'));
    expressions.push(new RegExp(`.*${searchTerm}.*`, 'i'));
    return expressions;
}

export const scoreRegex = (testPhrase: string | undefined, exp: RegExp, score = 1): number => {
    if(!testPhrase){
        return 0;
    }
    return exp.test(testPhrase) ? score : 0;
}

export const getDisplayFromSearch = (expressions: RegExp [], currentDisplay: Map<FilterOption, FilterOption[]>) => {
    let filteredDisplay: Map<FilterOption, FilterOption[]> = new Map<FilterOption, FilterOption[]>();
    let keys = [...currentDisplay.keys()];
        
    keys.forEach((key) => {
        let children = currentDisplay.get(key);
        let filteredByRegEx: FilterOption[] = [];
        if(children && children.length>0){
            filteredByRegEx = children.map(chlid => ({
                item: chlid,
                score: _.sumBy(
                    expressions,
                    singleExpression =>
                        scoreRegex(chlid?.name , singleExpression)
                ) 
                }))
                .filter(chlid => chlid.score > 0)
                .map(chlid => chlid.item)

            if(filteredByRegEx?.length && filteredByRegEx.length >0){
                filteredDisplay.set(key, filteredByRegEx);   
            }
        }

        else{
            filteredByRegEx = [{
                item: key,
                score: _.sumBy(
                    expressions,
                    singleExpression =>
                        scoreRegex(key?.name, singleExpression) 
                )
                }]
                .filter(e => e.score>0)
                .map(e=>e.item);
        
            if(filteredByRegEx.length>0){
                filteredDisplay.set(key, []);
            }
        }
    })
    return filteredDisplay;
}