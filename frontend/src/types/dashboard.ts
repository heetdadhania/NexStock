export interface DashboardStats {
  total_products: number;
  total_categories: number;
  total_inventory_quantity: number;
  low_stock_count: number;
}

export interface TrendPoint {
  date: string; // YYYY-MM-DD
  stock_in: number;
  stock_out: number;
}

export interface LowStockItem {
  product_id: number;
  product_name: string;
  sku: string;
  current_quantity: number;
  minimum_quantity: number;
}

export interface RecentActivity {
  product_name: string;
  type: "IN" | "OUT";
  quantity: number;
  date: string;
  created_by_name: string;
}

export interface V2Stats {
  total_warehouses: number;
  total_suppliers: number;
  open_purchase_orders: number;
  pending_transfers: number;
  total_inventory_quantity: number;
  low_stock_count: number;
}

export interface WarehouseDistribution {
  warehouse_id: number;
  warehouse_name: string;
  total_quantity: number;
}

export interface POStatusSummary {
  status: string;
  count: number;
  total_value: number;
}

export interface TransferActivityPoint {
  date: string;
  transfers_created: number;
  transfers_completed: number;
}
