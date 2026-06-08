import apiClient from "@/services/apiClient";
import type {
  InventoryReportItem,
  StockMovementReportItem,
  LowStockReportItem,
  MovementReportFilters,
} from "@/types/report";

interface StandardResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const reportService = {
  /**
   * Fetches general inventory reports.
   */
  async getInventoryReport(categoryId?: number): Promise<InventoryReportItem[]> {
    const url = categoryId ? `/api/reports/inventory?category_id=${categoryId}` : "/api/reports/inventory";
    const response = await apiClient.get<StandardResponse<InventoryReportItem[]>>(url);
    return response.data.data;
  },

  /**
   * Fetches historical stock movements reports matching filters.
   */
  async getStockMovementReport(filters?: MovementReportFilters): Promise<StockMovementReportItem[]> {
    const params: Record<string, any> = {};
    if (filters) {
      if (filters.product_id) params.product_id = filters.product_id;
      if (filters.type) params.type = filters.type;
      if (filters.from_date) params.from_date = filters.from_date;
      if (filters.to_date) params.to_date = filters.to_date;
    }

    const response = await apiClient.get<StandardResponse<StockMovementReportItem[]>>(
      "/api/reports/stock-movements",
      { params }
    );
    return response.data.data;
  },

  /**
   * Fetches products low stock reports.
   */
  async getLowStockReport(): Promise<LowStockReportItem[]> {
    const response = await apiClient.get<StandardResponse<LowStockReportItem[]>>("/api/reports/low-stock");
    return response.data.data;
  },

  /**
   * Triggers browser CSV file download from backend export endpoints.
   */
  async exportCSV(
    type: "inventory" | "stock-movements" | "low-stock",
    filters?: Record<string, any>
  ): Promise<void> {
    const params: Record<string, any> = { format: "csv" };
    if (filters) {
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== "") {
          params[key] = filters[key];
        }
      });
    }

    const response = await apiClient.get(`/api/reports/export/${type}`, {
      params,
      responseType: "blob", // Important for receiving streamed files
    });

    const blob = new Blob([response.data], { type: "text/csv" });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;

    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `${type}_report_${dateStr}.csv`;
    link.setAttribute("download", filename);
    
    document.body.appendChild(link);
    link.click();
    
    // Clean up virtual DOM link
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  },
};
