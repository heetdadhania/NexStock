import apiClient from "@/services/apiClient";
import type { Supplier, SupplierCreate, SupplierUpdate } from "@/types/supplier";

interface StandardResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const supplierService = {
  /**
   * Fetches all suppliers.
   */
  async getAll(): Promise<Supplier[]> {
    const response = await apiClient.get<StandardResponse<Supplier[]>>(
      "/api/suppliers"
    );
    return response.data.data;
  },

  /**
   * Fetches a single supplier by ID.
   */
  async getById(id: number): Promise<Supplier> {
    const response = await apiClient.get<StandardResponse<Supplier>>(
      `/api/suppliers/${id}`
    );
    return response.data.data;
  },

  /**
   * Creates a new supplier.
   */
  async create(supplier: SupplierCreate): Promise<Supplier> {
    const response = await apiClient.post<StandardResponse<Supplier>>(
      "/api/suppliers",
      supplier
    );
    return response.data.data;
  },

  /**
   * Updates an existing supplier by ID.
   */
  async update(id: number, supplier: SupplierUpdate): Promise<Supplier> {
    const response = await apiClient.put<StandardResponse<Supplier>>(
      `/api/suppliers/${id}`,
      supplier
    );
    return response.data.data;
  },
};
