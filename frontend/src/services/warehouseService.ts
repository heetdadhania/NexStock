import apiClient from "@/services/apiClient";
import type { Warehouse, WarehouseCreate, WarehouseUpdate } from "@/types/warehouse";

interface StandardResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const warehouseService = {
  /**
   * Fetches all warehouses.
   */
  async getAll(): Promise<Warehouse[]> {
    const response = await apiClient.get<StandardResponse<Warehouse[]>>(
      "/api/warehouses"
    );
    return response.data.data;
  },

  /**
   * Fetches a single warehouse by ID.
   */
  async getById(id: number): Promise<Warehouse> {
    const response = await apiClient.get<StandardResponse<Warehouse>>(
      `/api/warehouses/${id}`
    );
    return response.data.data;
  },

  /**
   * Creates a new warehouse.
   */
  async create(warehouse: WarehouseCreate): Promise<Warehouse> {
    const response = await apiClient.post<StandardResponse<Warehouse>>(
      "/api/warehouses",
      warehouse
    );
    return response.data.data;
  },

  /**
   * Updates an existing warehouse by ID.
   */
  async update(id: number, warehouse: WarehouseUpdate): Promise<Warehouse> {
    const response = await apiClient.put<StandardResponse<Warehouse>>(
      `/api/warehouses/${id}`,
      warehouse
    );
    return response.data.data;
  },
};
