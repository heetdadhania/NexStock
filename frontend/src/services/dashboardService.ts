import apiClient from "@/services/apiClient";
import type {
  DashboardStats,
  TrendPoint,
  LowStockItem,
  RecentActivity,
  V2Stats,
  WarehouseDistribution,
  POStatusSummary,
  TransferActivityPoint,
} from "@/types/dashboard";

interface StandardResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const dashboardService = {
  /**
   * Fetches key metric counts for the dashboard.
   */
  async getStats(): Promise<DashboardStats> {
    const response = await apiClient.get<StandardResponse<DashboardStats>>("/api/dashboard/stats");
    return response.data.data;
  },

  /**
   * Fetches historical stock-in/stock-out movements over the last N days.
   */
  async getInventoryTrend(days: number): Promise<TrendPoint[]> {
    const response = await apiClient.get<StandardResponse<TrendPoint[]>>(
      `/api/dashboard/inventory-trend?days=${days}`
    );
    return response.data.data;
  },

  /**
   * Fetches the products currently running below safety stock margins.
   */
  async getLowStock(): Promise<LowStockItem[]> {
    const response = await apiClient.get<StandardResponse<LowStockItem[]>>("/api/dashboard/low-stock");
    return response.data.data;
  },

  /**
   * Fetches the audit trail logs for recent stock movements.
   */
  async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    const response = await apiClient.get<StandardResponse<RecentActivity[]>>(
      `/api/dashboard/recent-activity?limit=${limit}`
    );
    return response.data.data;
  },

  /**
   * Fetches V2 key metrics (total warehouses, suppliers, open POs, pending transfers).
   */
  async getV2Stats(): Promise<V2Stats> {
    const response = await apiClient.get<StandardResponse<V2Stats>>("/api/dashboard/v2/stats");
    return response.data.data;
  },

  /**
   * Fetches warehouse inventory distribution.
   */
  async getInventoryDistribution(): Promise<WarehouseDistribution[]> {
    const response = await apiClient.get<StandardResponse<WarehouseDistribution[]>>(
      "/api/dashboard/v2/inventory-distribution"
    );
    return response.data.data;
  },

  /**
   * Fetches purchase order status summary.
   */
  async getPOStatusSummary(): Promise<POStatusSummary[]> {
    const response = await apiClient.get<StandardResponse<POStatusSummary[]>>(
      "/api/dashboard/v2/po-status-summary"
    );
    return response.data.data;
  },

  /**
   * Fetches daily transfer activity logs for the last N days.
   */
  async getTransferActivity(days: number = 30): Promise<TransferActivityPoint[]> {
    const response = await apiClient.get<StandardResponse<TransferActivityPoint[]>>(
      `/api/dashboard/v2/transfer-activity?days=${days}`
    );
    return response.data.data;
  },
};
