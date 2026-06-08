import apiClient from "@/services/apiClient";
import type {
  InventoryItem,
  StockMovement,
  StockInRequest,
  StockOutRequest,
  MovementFilters,
} from "@/types/inventory";

interface StandardResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const inventoryService = {
  /**
   * Fetches the current inventory levels for all active products.
   */
  async getAll(): Promise<InventoryItem[]> {
    const response = await apiClient.get<StandardResponse<InventoryItem[]>>("/api/inventory");
    return response.data.data;
  },

  /**
   * Fetches inventory detail for a single product.
   */
  async getByProduct(productId: number): Promise<InventoryItem> {
    const response = await apiClient.get<StandardResponse<InventoryItem>>(
      `/api/inventory/${productId}`
    );
    return response.data.data;
  },

  /**
   * Logs a stock addition (Stock-In) for a product.
   */
  async stockIn(request: StockInRequest): Promise<StockMovement> {
    const response = await apiClient.post<StandardResponse<StockMovement>>(
      "/api/inventory/stock-in",
      request
    );
    return response.data.data;
  },

  /**
   * Logs a stock withdrawal (Stock-Out) for a product.
   */
  async stockOut(request: StockOutRequest): Promise<StockMovement> {
    const response = await apiClient.post<StandardResponse<StockMovement>>(
      "/api/inventory/stock-out",
      request
    );
    return response.data.data;
  },

  /**
   * Retrieves the history of stock movements based on filters.
   */
  async getMovements(filters?: MovementFilters): Promise<StockMovement[]> {
    // Clean empty strings or undefined keys from parameters before passing
    const params: Record<string, any> = {};
    if (filters) {
      if (filters.product_id) params.product_id = filters.product_id;
      if (filters.type) params.type = filters.type;
      if (filters.from_date) params.from_date = filters.from_date;
      if (filters.to_date) params.to_date = filters.to_date;
    }

    const response = await apiClient.get<StandardResponse<StockMovement[]>>(
      "/api/inventory/movements",
      { params }
    );
    return response.data.data;
  },
};
