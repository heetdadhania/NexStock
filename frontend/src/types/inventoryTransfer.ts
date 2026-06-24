export interface TransferItem {
  id: number;
  transfer_id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  quantity: number;
}

export type TransferStatus = "requested" | "approved" | "in_transit" | "completed" | "cancelled";

export interface InventoryTransfer {
  id: number;
  transfer_number: string;
  source_warehouse_id: number;
  source_warehouse_name: string;
  destination_warehouse_id: number;
  destination_warehouse_name: string;
  status: TransferStatus;
  created_by: number;
  created_at: string;
  items: TransferItem[];
  item_count: number;
}

export interface TransferItemCreate {
  product_id: number;
  quantity: number;
}

export interface TransferCreate {
  source_warehouse_id: number;
  destination_warehouse_id: number;
  items: TransferItemCreate[];
}
