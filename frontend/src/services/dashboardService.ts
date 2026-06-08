import apiClient from "@/services/apiClient";
import type {
  DashboardStats,
  TrendPoint,
  LowStockItem,
  RecentActivity,
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
};
