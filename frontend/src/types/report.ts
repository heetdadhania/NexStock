export interface InventoryReportItem {
  product_id: number;
  sku: string;
  name: string;
  category: string;
  current_quantity: number;
  minimum_quantity: number;
  maximum_quantity: number;
  unit_price: number;
  total_value: number;
  status: string;
}

export interface StockMovementReportItem {
  date: string;
  product_name: string;
  sku: string;
  type: "IN" | "OUT";
  quantity: number;
  remarks: string | null;
  created_by: number;
}

export interface LowStockReportItem {
  product_id: number;
  sku: string;
  name: string;
  category: string;
  current_quantity: number;
  minimum_quantity: number;
  shortage: number;
}

export interface InventoryReportFilters {
  category_id?: number;
}

export interface MovementReportFilters {
  from_date?: string;
  to_date?: string;
  product_id?: number;
  type?: "IN" | "OUT" | "";
}
