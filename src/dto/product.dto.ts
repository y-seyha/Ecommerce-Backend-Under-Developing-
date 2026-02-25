export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  stock?: number;
  category_id?: number;
  image_url?: string;
  image_public_id?: string;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category_id?: number;
  image_url?: string;
  image_public_id?: string;
}
