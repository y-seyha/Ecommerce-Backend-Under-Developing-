export interface Product {
  id?: number;
  name: string;
  description?: string;
  price: number;
  stock?: number;
  category_id?: number;
  created_at?: Date;
  updated_at?: Date;
  image_url?: string | null;
  image_public_id?: string | null;
}
