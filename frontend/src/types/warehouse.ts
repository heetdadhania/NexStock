export interface Warehouse {
  id: number;
  warehouse_code: string;
  warehouse_name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  inventory_count?: number;
}

export interface WarehouseCreate {
  warehouse_code: string;
  warehouse_name: string;
  address?: string;
  city: string;
  state?: string;
  country: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
}

export interface WarehouseUpdate {
  warehouse_code?: string;
  warehouse_name?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  is_active?: boolean;
}
