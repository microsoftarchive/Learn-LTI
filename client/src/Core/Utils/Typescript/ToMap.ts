export function toMap<TItem, TKey, TValue = TItem>(
  array: Array<TItem>,
  keySelector: (item: TItem) => TKey,
  valueTransformer?: (item: TItem) => TValue
): Map<TKey, TValue> {
  const returnMap = new Map<TKey, TValue>();
  if (array) {
    array.forEach(item => {
      const transformedItem = valueTransformer ? valueTransformer(item) : ((item as unknown) as TValue);
      const itemKey = keySelector(item);
      returnMap.set(itemKey, transformedItem);
    });
  }

  return returnMap;
}
