import apiClient from "@/services/apiClient";
import type { InventoryTransfer, TransferCreate } from "@/types/inventoryTransfer";

interface StandardResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const inventoryTransferService = {
  /**
   * Fetches all transfers.
   */
  async getAll(): Promise<InventoryTransfer[]> {
    const response = await apiClient.get<StandardResponse<InventoryTransfer[]>>(
      "/api/transfers"
    );
    return response.data.data;
  },

  /**
   * Fetches details of a single transfer by ID.
   */
  async getById(id: number): Promise<InventoryTransfer> {
    const response = await apiClient.get<StandardResponse<InventoryTransfer>>(
      `/api/transfers/${id}`
    );
    return response.data.data;
  },

  /**
   * Creates a new transfer.
   */
  async create(transfer: TransferCreate): Promise<InventoryTransfer> {
    const response = await apiClient.post<StandardResponse<InventoryTransfer>>(
      "/api/transfers",
      transfer
    );
    return response.data.data;
  },

  /**
   * Approves a transfer.
   */
  async approve(id: number): Promise<InventoryTransfer> {
    const response = await apiClient.post<StandardResponse<InventoryTransfer>>(
      `/api/transfers/${id}/approve`
    );
    return response.data.data;
  },

  /**
   * Ships a transfer (sets in-transit).
   */
  async ship(id: number): Promise<InventoryTransfer> {
    const response = await apiClient.post<StandardResponse<InventoryTransfer>>(
      `/api/transfers/${id}/ship`
    );
    return response.data.data;
  },

  /**
   * Completes a transfer.
   */
  async complete(id: number): Promise<InventoryTransfer> {
    const response = await apiClient.post<StandardResponse<InventoryTransfer>>(
      `/api/transfers/${id}/complete`
    );
    return response.data.data;
  },

  /**
   * Cancels a transfer.
   */
  async cancel(id: number): Promise<InventoryTransfer> {
    const response = await apiClient.post<StandardResponse<InventoryTransfer>>(
      `/api/transfers/${id}/cancel`
    );
    return response.data.data;
  },
};

export default inventoryTransferService;
