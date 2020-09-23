import { Product, Role, Level, Catalog } from '../../Models/Learn';
import { FilterType } from '../../Models/Learn/FilterType.model'; 
import { LearnTypeFilterOption, FilterOption } from './MicrosoftLearnFilterComponentProps';
import _ from 'lodash';
import { scoreRegex } from "./MicrosoftLearnFilterCore";

const FilterOptionComparer = (a: FilterOption, b: FilterOption) => {
    if(a && b){
        return a.name.localeCompare(b.name);
    }
    else if(a){
        return 1;
    }
    return -1;
}

const createOptoinArrayFromKeys = (keys: FilterOption[]) => {
    let map: Map<FilterOption, FilterOption[]> = new Map<FilterOption, FilterOption[]>();
    keys.forEach(key => map.set(key, []));
    return map; 
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
                productParentChildMap.set(parent, children.sort(FilterOptionComparer));
                included = [...included, ...children, parent]
        })
        products.filter(item => !included.includes(item) && item.id===item.parentId)
                .forEach(p=> productParentChildMap.set(p, []));
    }
    return productParentChildMap;
}

export const getRolesToDisplay = (roleId: string[] | undefined, roleMap: Map<string, Role> | undefined) =>{
    if(roleMap!=null){
        let sortedRoles = roleId?.map(id => roleMap.get(id)!!).sort(FilterOptionComparer);
        return createOptoinArrayFromKeys(sortedRoles || []);
    }
    return new Map<Role, Role[]>();
}

export const getLevelsToDisplay = (levelId:  string[] | undefined, levelMap: Map<string, Level> | undefined) => {
    if(levelMap!=null){
        let sortedLevels = levelId?.map(id => levelMap.get(id)!!).sort(FilterOptionComparer); 
        return createOptoinArrayFromKeys(sortedLevels || []);
    }
    return new Map<Level, Level[]>();
}

export const getTypesToDisplay = (typeId: string[] | undefined) =>{
    const t1: LearnTypeFilterOption =  { id:'module', name:'Module' };
    const t2: LearnTypeFilterOption = { id:'learningPath', name:'Learning Path' };
    return createOptoinArrayFromKeys(typeId?.sort().map(id => id==='module'? t1 : t2) || []);
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
        let _tags: FilterTag[] = [];
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
         typeTags = typeFilters?.map(typeId =>  typeId==='module'? { id: typeId, name: 'Module', type: FilterType.Type }
                                                                 : { id: typeId, name: 'Learning Path', type: FilterType.Type })         
    }
    return  [...productTags, ...roleTags, ...levelTags, ...typeTags]
}



export const getDisplayFromSearch = (expressions: RegExp [], currentDisplay: Map<FilterOption, FilterOption[]>) => {
    let filteredDisplay: Map<FilterOption, FilterOption[]> = new Map<FilterOption, FilterOption[]>();
    [...currentDisplay.keys()].forEach((key) => {
        let children = currentDisplay.get(key);
        let filteredByRegEx: FilterOption[] = [];
        if(children && children.length>0){
            filteredByRegEx = children.map(chlid => ({
                item: chlid,
                score: _.sumBy( expressions, singleExpression => scoreRegex(chlid?.name , singleExpression) ) 
                }))
                .filter(chlid => chlid.score > 0).map(chlid => chlid.item);
            if(filteredByRegEx?.length && filteredByRegEx.length >0){
                filteredDisplay.set(key, filteredByRegEx);   
            }
        }

        else{
            filteredByRegEx = [{
                item: key,
                score: _.sumBy( expressions, singleExpression => scoreRegex(key?.name, singleExpression) )
                }].filter(element => element.score>0).map(element=>element.item);
            if(filteredByRegEx.length>0){
                filteredDisplay.set(key, []);
            }
        }
    })
    return filteredDisplay;
}
