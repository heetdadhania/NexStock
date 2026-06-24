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

// ---------------------------------------------------------------------------
// V2 Report Types
// ---------------------------------------------------------------------------

export interface WarehouseInventoryReportItem {
  warehouse_name: string;
  product_name: string;
  sku: string;
  quantity: number;
  minimum_quantity: number;
  maximum_quantity: number;
  is_low_stock: boolean;
}

export interface SupplierReportItem {
  supplier_code: string;
  supplier_name: string;
  email: string;
  rating: number | null;
  is_active: boolean;
  total_orders: number;
  total_value: number;
}

export interface PurchaseOrderReportItem {
  po_number: string;
  supplier_name: string;
  warehouse_name: string;
  status: string;
  order_date: string;
  item_count: number;
  total_value: number;
}

export interface TransferReportItem {
  transfer_number: string;
  source_warehouse: string;
  destination_warehouse: string;
  status: string;
  created_at: string;
  item_count: number;
}

export interface WarehouseInventoryReportFilters {
  warehouse_id?: number;
  low_stock_only?: boolean;
}

export interface PurchaseOrderReportFilters {
  status?: string;
  supplier_id?: number;
  warehouse_id?: number;
  from_date?: string;
  to_date?: string;
}

export interface TransferReportFilters {
  status?: string;
  source_warehouse_id?: number;
  destination_warehouse_id?: number;
}

