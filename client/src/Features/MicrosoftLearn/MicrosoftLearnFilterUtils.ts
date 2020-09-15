import { Product, Role, Level } from '../../Models/Learn';
import { FilterType } from '../../Models/Learn/FilterType.model'; 
import { LearnTypeFilterOption, FilterOption } from './MicrosoftLearnFilterComponentProps';
import { RoleDto, LevelDto } from '../../Dtos/Learn';
import _ from 'lodash';



export const FilterOptionComparer = (a: FilterOption, b: FilterOption) => {
    if(a && b){
        return a.name.localeCompare(b.name);
    }
    else if(a){
        return 1;
    }
    return -1;
}

export const getProductsToDisplay = (productId: string[] | undefined, productMap: Map<string, Product> | undefined) =>{

    let products: Map<string, Product> = new Map<string, Product>();
    let productParentChildMap = new Map<Product, Product[]>();
    if(productMap!=null){

        productId?.forEach((pid)=>{
            let product = productMap.get(pid)
            if(product){
                products.set(pid, product);
            }
        })
        // const parentProducts = [...products.values()].filter(item => item && item?.parentId==null)
        // .sort(FilterOptionComparer);
        // let included: Product[] = []
        // parentProducts.forEach((parent) => {
        //         let children = [...products.values()]
        //         .filter(product=> product?.parentId && product.parentId==parent?.id);                
        //         productParentChildMap.set(parent, children);
        //         included = [...included, ...children, parent]
        // })

        // let leftOver = [...products.values()].filter(item => !included.includes(item))
        // console.log("leftover", leftOver);

        products.forEach((item)=>{
            if(item !=null && item.parentId!=null){
               let parentItem = products.get(item.parentId);
               if(parentItem!=null){
                let previousChildren = productParentChildMap.get(parentItem);  
                previousChildren?.push(item);
                previousChildren?.sort(FilterOptionComparer);
                productParentChildMap.set(parentItem, previousChildren?previousChildren:[]);
               }
            }
        }) 

        let sortedProductParentChildMap = new Map<Product, Product []>();
        let sortedKeys = Array.from(productParentChildMap.keys()).sort(FilterOptionComparer);
        sortedKeys.forEach((item)=>{
            let val = productParentChildMap.get(item)
            sortedProductParentChildMap.set(item, val? val : []);
        })
        productParentChildMap = sortedProductParentChildMap;
    }
    return productParentChildMap;
}

export const getRolesToDisplay = (roleId: string[] | undefined, roleMap: Map<string, Role> |undefined) =>{
    let roles = new Map<Pick<RoleDto, "id" | "name"> | undefined , Pick<RoleDto, "id" | "name">[]>();
    if(roleMap!=null){
        roleId?.forEach((rid)=>{
            if(roleMap.get(rid)){
                roles.set(roleMap.get(rid), []);
            }            
        });

        let sortedKeys = Array.from(roles.keys()).sort(FilterOptionComparer);
        let sortedRoles = new Map<Pick<RoleDto, "id" | "name"> | undefined , Pick<RoleDto, "id" | "name">[]>();
        sortedKeys.forEach((item)=>{
            let val = roles.get(item)
            sortedRoles.set(item, val? val : []);
        })
        roles = sortedRoles;    
    }
    return roles;
}

export const getLevelsToDisplay = (levelId:  string[] | undefined, levelMap: Map<string, Level> | undefined) => {
    let levels = new Map< Pick<LevelDto, "id" | "name"> | undefined, Pick<LevelDto, "id" | "name">[]>();
    if(levelMap!=null){
        levelId?.forEach((lid)=>{
            if(levelMap.get(lid)){
                levels.set(levelMap.get(lid), []);
            }
        })
        let sortedKeys = Array.from(levels.keys()).sort(FilterOptionComparer);
        let sortedLevels = new Map< Pick<LevelDto, "id" | "name"> | undefined, Pick<LevelDto, "id" | "name">[]>();
        sortedKeys.forEach((item) =>{
            let val = levels.get(item)
            sortedLevels.set(item, val? val: []);
        })
        levels = sortedLevels;
    }
    return levels;
}

export const getTypesToDisplay = (typeId: string[] | undefined) =>{
    let types = new Map<LearnTypeFilterOption, LearnTypeFilterOption[]>();
    const t1: LearnTypeFilterOption =  {
        id:'module',
        name:'Module'
    }

    const t2: LearnTypeFilterOption = {
        id:'learningPath',
        name:'Learning Path'
    }
    typeId?.forEach((tid)=>{
        switch(tid){
            case 'module':     
                types.set(t1, []);           
                break;
            case 'learningPath':
                types.set(t2, []);
                break;
        }                
        })
    
    let sortedTypes = new Map<LearnTypeFilterOption, LearnTypeFilterOption[]>();
    let sortedKeys = Array.from(types.keys()).sort(FilterOptionComparer);
    sortedKeys.forEach((item)=>{
        let val = types.get(item);
        sortedTypes.set(item, val? val: []);
    })
    types = sortedTypes;
    return types; 
}

export const getDisplayFilterTags = (displayFilters: Map<FilterType, string[]>, selectedFilters: Map<FilterType, string[]>, productsMap: Map<Product, Product[]>) => {

    const getIntersection = (type: FilterType) => {
        let intersect = displayFilters.get(type)?.filter(item => selectedFilters.get(type)?.includes(item));
        if(type===FilterType.Product){
            let keys = Array.from(productsMap.keys())
            keys.forEach((item) => {
                if(intersect?.includes(item.id)){
                    let childId = productsMap.get(item)?.map(child => child.id)
                    intersect = intersect.filter(i => !childId?.includes(i))
                }
            })
        }
        return intersect;
    }

    let productTags = getIntersection(FilterType.Product);
    let roleTags = getIntersection(FilterType.Role);
    let levelTags = getIntersection(FilterType.Level);
    let typeTags = getIntersection(FilterType.Type);
    let tagMap: Map<FilterType, string[]> = new Map<FilterType, string[]>();

    tagMap.set(FilterType.Product, productTags?productTags:[]);
    tagMap.set(FilterType.Role, roleTags?roleTags:[]);
    tagMap.set(FilterType.Level, levelTags?levelTags:[]);
    tagMap.set(FilterType.Type, typeTags?typeTags:[]);
    return tagMap;
}


export const getRegexs = (searchTerm: string): RegExp[] => {
    const expressions: RegExp[] = searchTerm
      .trim()
      .replace(/\s+/g, ' ')
      .split(' ')
      .map(termPart => new RegExp(`.*${termPart}.*`, 'i'));
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
        let keys = Array.from(currentDisplay.keys());
        
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