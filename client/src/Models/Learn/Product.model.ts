import { ProductDto } from '../../Dtos/Learn';

export type Product = Omit<ProductDto, 'children'> & {
  parentId: string | null;
};
