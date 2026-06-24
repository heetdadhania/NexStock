export interface PurchaseOrderItem {
  id: number;
  purchase_order_id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export type PurchaseOrderStatus = "draft" | "approved" | "received" | "cancelled";

export interface PurchaseOrder {
  id: number;
  po_number: string;
  supplier_id: number;
  supplier_name: string;
  warehouse_id: number;
  warehouse_name: string;
  status: PurchaseOrderStatus;
  order_date: string;
  expected_date: string | null;
  created_by: number;
  created_at: string;
  items: PurchaseOrderItem[];
  item_count: number;
  total_value: number;
}

export interface PurchaseOrderItemCreate {
  product_id: number;
  quantity: number;
  unit_price: number;
}

export interface PurchaseOrderCreate {
  supplier_id: number;
  warehouse_id: number;
  order_date: string;
  expected_date: string | null;
  items: PurchaseOrderItemCreate[];
}
