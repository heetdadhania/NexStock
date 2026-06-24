import apiClient from "@/services/apiClient";
import type { PurchaseOrder, PurchaseOrderCreate } from "@/types/purchaseOrder";

interface StandardResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const purchaseOrderService = {
  /**
   * Fetches all purchase orders.
   */
  async getAll(): Promise<PurchaseOrder[]> {
    const response = await apiClient.get<StandardResponse<PurchaseOrder[]>>(
      "/api/purchase-orders"
    );
    return response.data.data;
  },

  /**
   * Fetches a single purchase order by ID.
   */
  async getById(id: number): Promise<PurchaseOrder> {
    const response = await apiClient.get<StandardResponse<PurchaseOrder>>(
      `/api/purchase-orders/${id}`
    );
    return response.data.data;
  },

  /**
   * Creates a new purchase order.
   */
  async create(order: PurchaseOrderCreate): Promise<PurchaseOrder> {
    const response = await apiClient.post<StandardResponse<PurchaseOrder>>(
      "/api/purchase-orders",
      order
    );
    return response.data.data;
  },

  /**
   * Approves a purchase order.
   */
  async approve(id: number): Promise<PurchaseOrder> {
    const response = await apiClient.post<StandardResponse<PurchaseOrder>>(
      `/api/purchase-orders/${id}/approve`
    );
    return response.data.data;
  },

  /**
   * Receives a purchase order and updates inventory.
   */
  async receive(id: number): Promise<PurchaseOrder> {
    const response = await apiClient.post<StandardResponse<PurchaseOrder>>(
      `/api/purchase-orders/${id}/receive`
    );
    return response.data.data;
  },

  /**
   * Cancels a purchase order.
   */
  async cancel(id: number): Promise<PurchaseOrder> {
    const response = await apiClient.post<StandardResponse<PurchaseOrder>>(
      `/api/purchase-orders/${id}/cancel`
    );
    return response.data.data;
  },
};
export default purchaseOrderService;
