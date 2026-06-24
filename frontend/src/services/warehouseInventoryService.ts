import apiClient from "@/services/apiClient";
import type { WarehouseInventoryItem } from "@/types/warehouseInventory";

interface StandardResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const warehouseInventoryService = {
  /**
   * Fetches all inventory records for a specific warehouse.
   */
  async getByWarehouse(warehouseId: number): Promise<WarehouseInventoryItem[]> {
    const response = await apiClient.get<StandardResponse<WarehouseInventoryItem[]>>(
      `/api/warehouses/${warehouseId}/inventory`
    );
    return response.data.data;
  },

  /**
   * Fetches all low-stock inventory records across all warehouses.
   */
  async getLowStock(): Promise<WarehouseInventoryItem[]> {
    const response = await apiClient.get<StandardResponse<WarehouseInventoryItem[]>>(
      "/api/warehouse-inventory/low-stock"
    );
    return response.data.data;
  },
};
