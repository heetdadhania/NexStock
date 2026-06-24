import apiClient from "@/services/apiClient";
import type { ActivityLog, ActivityLogFilters } from "@/types/activityLog";

interface StandardResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const activityLogService = {
  /**
   * Fetches activity logs matching the filter criteria.
   */
  async getAll(filters: ActivityLogFilters = {}): Promise<ActivityLog[]> {
    const params: Record<string, any> = {};
    if (filters.entity_type) params.entity_type = filters.entity_type;
    if (filters.user_id) params.user_id = filters.user_id;
    if (filters.from_date) params.from_date = filters.from_date;
    if (filters.to_date) params.to_date = filters.to_date;
    if (filters.limit) params.limit = filters.limit;

    const response = await apiClient.get<StandardResponse<ActivityLog[]>>(
      "/api/activity-logs",
      { params }
    );
    return response.data.data;
  },

  /**
   * Fetches the most recent activity logs.
   */
  async getRecent(limit: number = 10): Promise<ActivityLog[]> {
    return this.getAll({ limit });
  },
};
