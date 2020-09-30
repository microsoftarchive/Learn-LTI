import { ProductChildDto } from './ProductChild.dto';

export interface ProductDto {
  id: string;
  name: string;
  children: ProductChildDto[];
}
