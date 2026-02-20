export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  stock?: number;
  category_id?: number;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category_id?: number;
}
