export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  category_id: number;
  category_name: string;
  unit_price: number;
  is_active: boolean;
  current_quantity: number;
  minimum_quantity: number;
  maximum_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface ProductCreate {
  sku: string;
  name: string;
  description?: string;
  category_id: number;
  unit_price: number;
  minimum_quantity?: number;
  maximum_quantity?: number;
}

export interface ProductUpdate {
  sku?: string;
  name?: string;
  description?: string;
  category_id?: number;
  unit_price?: number;
  minimum_quantity?: number;
  maximum_quantity?: number;
}
