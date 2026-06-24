export interface Supplier {
  id: number;
  supplier_code: string;
  supplier_name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  rating: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  purchase_order_count?: number;
}

export interface SupplierCreate {
  supplier_code: string;
  supplier_name: string;
  contact_person?: string;
  email: string;
  phone?: string;
  address?: string;
  rating?: number | null;
}

export interface SupplierUpdate {
  supplier_code?: string;
  supplier_name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  rating?: number | null;
  is_active?: boolean;
}
