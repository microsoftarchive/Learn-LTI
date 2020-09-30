import _ from "lodash";
import { Catalog, Product, LearnContent } from "../../Models/Learn";
import { FilterType } from "../../Models/Learn/FilterType.model";

export const filterLearnContent = (catalog: Catalog | null, selectedFilters: Map<FilterType, string[]>, searchTerm: string, productHierarchicalMap: Map<Product, Product[]>, expandedProducts: string[], searchExpressions?: RegExp[]) => {
    if(catalog){
        let _filteredCatalogContent =  applySelectedFilter(catalog, selectedFilters, searchTerm, searchExpressions) 
        let _displayFilters = setDisplayFilters(catalog, _filteredCatalogContent);
        let _uri = updateURI(selectedFilters, searchTerm, expandedProducts, productHierarchicalMap);

        if(searchExpressions===undefined){
            let _newSelected: Map<FilterType, string[]> = new Map<FilterType, string[]>();
            [...selectedFilters.keys()].forEach(type => {
                let _newFilters = removeExtrasFromSelected(type, catalog, selectedFilters, _displayFilters, productHierarchicalMap);
                if(_newFilters){
                    _newSelected.set(type, _newFilters);
                }
            });
            return {
                filteredCatalogContent: _filteredCatalogContent,
                displayFilters: _displayFilters,
                uri: _uri,
                newSelectedFilters: _newSelected
            }
        }

        return {
            filteredCatalogContent: _filteredCatalogContent,
            displayFilters: _displayFilters,
            uri: _uri
        }
    }
    return null;
}


const applySelectedFilter = (catalog: Catalog, selectedFilters: Map<FilterType, string[]>, searchTerm: string, searchExpressions?: RegExp[]) => {
        let productFilter = selectedFilters.get(FilterType.Product) || [];
        let roleFilter = selectedFilters.get(FilterType.Role) || [];
        let typeFilter = selectedFilters.get(FilterType.Type) || [];
        let levelFilter = selectedFilters.get(FilterType.Level) || [];
        let _filteredCatalogContent :LearnContent[] =  [...catalog?.contents.values()]    
                                    .filter(content => (
                                      ((productFilter.length===0 || _.intersection(content.products, productFilter).length>0) &&
                                      (roleFilter.length===0 || _.intersection(content.roles, roleFilter).length>0) &&
                                      (levelFilter.length===0 || _.intersection(content.levels, levelFilter).length>0) &&
                                      (typeFilter.length===0 || _.intersection([content.type], typeFilter).length>0)
                                      )))                      

        _filteredCatalogContent = searchExpressions? getSearchTermFilteredLearnContent(searchExpressions, _filteredCatalogContent)
                                        : getSearchTermFilteredLearnContent(getRegexs(searchTerm), _filteredCatalogContent);

        return _filteredCatalogContent;
}


const removeExtrasFromSelected = (type: FilterType, catalog: Catalog, selectedFilters: Map<FilterType, string[]>, displayFilters: Map<FilterType, string[]>, productHierarchicalMap: Map<Product, Product[]>) => {
  if(type===FilterType.Product){
        let parentProducts = [...productHierarchicalMap.keys()]; 
        let prevSelected = selectedFilters.get(type);
        let newDisplay = displayFilters.get(type);
        const selectedInvisibleItems = prevSelected?.filter(item => newDisplay && !newDisplay.includes(item))
      
        let removeParentProducts = parentProducts?.filter(parent => selectedInvisibleItems?.includes(parent.id)).map(parent => parent.id);
        let removeChilrenProducts = [...catalog?.products.values()]
                                    .filter(product => (product.parentId && (removeParentProducts.includes(product.parentId) ||
                                    (!prevSelected?.includes(product.parentId) && prevSelected?.includes(product.id) && !newDisplay?.includes(product.id)))))
                                    .map(product => product.id);

        let removeProducts = [...removeParentProducts, ...removeChilrenProducts];
        let newSelected = prevSelected?.filter(item => !removeProducts.includes(item));
        return newSelected;
    }

    else{
      let prevSelected = selectedFilters.get(type);
      let newDisplay = displayFilters.get(type);
      if(prevSelected!==undefined && newDisplay!==undefined){
        return  _.intersection(prevSelected, newDisplay);
      }
    }
}
    
export const setDisplayFilters = (catalog: Catalog, filteredContent: LearnContent[]) => {
    let filteredProducts = new Set<string>();
    let filteredRoles = new Set<string>(_.flatten(filteredContent.map(content => content.roles)));
    let filteredTypes = new Set<string>(_.flatten(filteredContent.map(content => [content.type])));
    let filteredLevels = new Set<string>(_.flatten(filteredContent.map(content => content.levels)));

    const products = _.flatten(filteredContent.map(content => content.products));
    const parents = products.map(product => catalog?.products.get(product)?.parentId || '').filter(pId => pId.length>0)
    filteredProducts = new Set([...parents, ...products]);

    let displayFilters: Map<FilterType, string[]> = new Map<FilterType, string[]>();
    displayFilters.set(FilterType.Product, [...filteredProducts]);
    displayFilters.set(FilterType.Role, [...filteredRoles]);
    displayFilters.set(FilterType.Level, [...filteredLevels]);
    displayFilters.set(FilterType.Type, [...filteredTypes]);

    return displayFilters;
}        

export const updateURI = (selectedFilters: Map<FilterType, string[]>, searchTerm: string, expandedProducts: string[], productHierarchicalMap: Map<Product, Product[]>) => {
    let productFilter = selectedFilters.get(FilterType.Product) || [];
    let roleFilter = selectedFilters.get(FilterType.Role) || [];
    let typeFilter = selectedFilters.get(FilterType.Type) || [];
    let levelFilter = selectedFilters.get(FilterType.Level) || [];

    const getProductUri = () => {
      let parents = [...productHierarchicalMap.keys()]; 
      let keep: string[] = [];
      let parentProductFilters: Product[] = parents.filter(p => productFilter.includes(p.id));
      let invisibleChildren = _.flatten(parentProductFilters.map(parent => productHierarchicalMap.get(parent)?.map(c=>c.id)));

      keep = [...keep, ...productFilter.filter(f => !keep.includes(f) && !invisibleChildren.includes(f))];
      return 'products='+keep.join('%2C');
    }

    let productUri = productFilter.length>0? getProductUri() : '';
    let roleUri = roleFilter.length>0? 'roles=' + roleFilter.join('%2C') : '';
    let typeUri = typeFilter.length>0? 'types=' + typeFilter.join('%2C') : '';
    let levelUri = levelFilter.length>0? 'levels=' + levelFilter.join('%2C') : '';
    let termsUri = searchTerm.length>0? 'terms='+searchTerm : '';
    let expandedProductsUri = expandedProducts.length>0? 'expanded='+expandedProducts.join('%2C') : '';
    let finalUri = [productUri, roleUri, levelUri, typeUri, termsUri, expandedProductsUri]
                    .filter(s=>s.length!==0).join('&')            

    let uri = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + finalUri;
    window.history.pushState({path:uri},'',uri);       

    return finalUri;
}

const getSearchTermFilteredLearnContent = (expressions: RegExp[], content: LearnContent[]): LearnContent[] => {
    return content
      .map(course => ({
        course: course,
        score: _.sumBy(
          expressions,
          singleExpression =>
            scoreRegex(course.summary, singleExpression) + scoreRegex(course.title, singleExpression, 2)
        )
      }))
      .filter(scouredCourse => scouredCourse.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(scoredCourse => scoredCourse.course);
}

export const loadFiltersFromPath = (catalog: Catalog, productHierarchicalMap: Map<Product, Product[]>) => {
    let searchParams = window.location.search
    if(searchParams.length>0){
      let searchParamMap: Map<string, string[]> = new Map<string, string[]>();
      searchParams.slice(1).split('&').forEach(s=>{
        let [key, value] = s.split('=');
        searchParamMap.set(key, value.split('%2C'));
      })

      let _selectedFilters: Map<FilterType, string[]> = new Map<FilterType, string[]>();

      let _expandedProducts = searchParamMap.get("expanded") || [];
      _selectedFilters.set(FilterType.Role, searchParamMap.get('roles') || []);
      _selectedFilters.set(FilterType.Level, searchParamMap.get('levels') || []);
      _selectedFilters.set(FilterType.Type, searchParamMap.get('types') || []);

      let setProducts = searchParamMap.get('products');
      if(setProducts){
        let parents = [...productHierarchicalMap.keys()];
        let parenIds = parents.map(p => p.id);
        
        let selectedParents = setProducts.filter(p => parenIds.includes(p)).map(pId => catalog?.products.get(pId)!!); 
        let addChildren = _.flatten(selectedParents.map(p => productHierarchicalMap.get(p)!!)).map(c=>c.id);
        _selectedFilters.set(FilterType.Product,  [...setProducts, ...addChildren]);
      }

      let _searchTerm = searchParamMap.get("terms");

      return {
            selectedFilters: _selectedFilters,
            expandedProducts: _expandedProducts,
            searchTerm: _searchTerm? _searchTerm[0].split('%20').join(' ') : ''
        }
    }
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