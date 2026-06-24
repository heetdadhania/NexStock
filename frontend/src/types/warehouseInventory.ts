export interface WarehouseInventoryItem {
  id: number;
  warehouse_id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  category_name: string;
  warehouse_name: string;
  warehouse_code: string;
  quantity: number;
  minimum_quantity: number;
  maximum_quantity: number;
  is_low_stock: boolean;
  updated_at: string;
}
