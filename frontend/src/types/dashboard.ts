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
