export interface InventoryItem {
  id: number; // Represents the Product ID
  product_name: string;
  sku: string;
  current_quantity: number;
  minimum_quantity: number;
  maximum_quantity: number;
  status: string; // "Low Stock" or "In Stock"
  is_low_stock: boolean;
}

export interface StockMovement {
  id: number;
  product_id: number;
  product_name: string;
  sku: string;
  movement_type: "IN" | "OUT";
  quantity: number;
  remarks: string | null;
  created_by: number;
  created_at: string;
}

export interface StockInRequest {
  product_id: number;
  quantity: number;
  remarks?: string;
}

export interface StockOutRequest {
  product_id: number;
  quantity: number;
  remarks?: string;
}

export interface MovementFilters {
  product_id?: number;
  type?: "IN" | "OUT" | "";
  from_date?: string;
  to_date?: string;
}
