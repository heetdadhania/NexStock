import apiClient from "@/services/apiClient";
import type {
  InventoryReportItem,
  StockMovementReportItem,
  LowStockReportItem,
  MovementReportFilters,
  WarehouseInventoryReportItem,
  WarehouseInventoryReportFilters,
  SupplierReportItem,
  PurchaseOrderReportItem,
  PurchaseOrderReportFilters,
  TransferReportItem,
  TransferReportFilters,
} from "@/types/report";

interface StandardResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const reportService = {
  // ---------------------------------------------------------------------------
  // V1 Methods (unchanged)
  // ---------------------------------------------------------------------------

  /** Fetches general inventory reports. */
  async getInventoryReport(categoryId?: number): Promise<InventoryReportItem[]> {
    const url = categoryId
      ? `/api/reports/inventory?category_id=${categoryId}`
      : "/api/reports/inventory";
    const response = await apiClient.get<StandardResponse<InventoryReportItem[]>>(url);
    return response.data.data;
  },

  /** Fetches historical stock movements reports matching filters. */
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

  /** Fetches products low stock reports. */
  async getLowStockReport(): Promise<LowStockReportItem[]> {
    const response = await apiClient.get<StandardResponse<LowStockReportItem[]>>(
      "/api/reports/low-stock"
    );
    return response.data.data;
  },

  /** Triggers browser CSV file download from backend V1 export endpoints. */
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
      responseType: "blob",
    });
    const blob = new Blob([response.data], { type: "text/csv" });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute("download", `${type}_report_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  },

  // ---------------------------------------------------------------------------
  // V2 Methods
  // ---------------------------------------------------------------------------

  /** Fetches per-warehouse product inventory report with low-stock flag. */
  async getWarehouseInventoryReport(
    filters?: WarehouseInventoryReportFilters
  ): Promise<WarehouseInventoryReportItem[]> {
    const params: Record<string, any> = {};
    if (filters?.warehouse_id) params.warehouse_id = filters.warehouse_id;
    if (filters?.low_stock_only) params.low_stock_only = filters.low_stock_only;
    const response = await apiClient.get<StandardResponse<WarehouseInventoryReportItem[]>>(
      "/api/reports/warehouse-inventory",
      { params }
    );
    return response.data.data;
  },

  /** Fetches supplier report with total PO count and received-PO value. */
  async getSupplierReport(): Promise<SupplierReportItem[]> {
    const response = await apiClient.get<StandardResponse<SupplierReportItem[]>>(
      "/api/reports/suppliers"
    );
    return response.data.data;
  },

  /** Fetches purchase orders report with aggregated values and filter support. */
  async getPurchaseOrderReport(
    filters?: PurchaseOrderReportFilters
  ): Promise<PurchaseOrderReportItem[]> {
    const params: Record<string, any> = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.supplier_id) params.supplier_id = filters.supplier_id;
    if (filters?.warehouse_id) params.warehouse_id = filters.warehouse_id;
    if (filters?.from_date) params.from_date = filters.from_date;
    if (filters?.to_date) params.to_date = filters.to_date;
    const response = await apiClient.get<StandardResponse<PurchaseOrderReportItem[]>>(
      "/api/reports/purchase-orders",
      { params }
    );
    return response.data.data;
  },

  /** Fetches inventory transfer report with warehouse names and item counts. */
  async getTransferReport(filters?: TransferReportFilters): Promise<TransferReportItem[]> {
    const params: Record<string, any> = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.source_warehouse_id) params.source_warehouse_id = filters.source_warehouse_id;
    if (filters?.destination_warehouse_id)
      params.destination_warehouse_id = filters.destination_warehouse_id;
    const response = await apiClient.get<StandardResponse<TransferReportItem[]>>(
      "/api/reports/transfers",
      { params }
    );
    return response.data.data;
  },

  /** Triggers browser CSV download from a V2 export endpoint. */
  async exportV2CSV(
    type: "warehouse-inventory" | "suppliers" | "purchase-orders" | "transfers",
    filters?: Record<string, any>
  ): Promise<void> {
    const params: Record<string, any> = { format: "csv" };
    if (filters) {
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== "" && filters[key] !== false) {
          params[key] = filters[key];
        }
      });
    }
    const response = await apiClient.get(`/api/reports/export/${type}`, {
      params,
      responseType: "blob",
    });
    const blob = new Blob([response.data], { type: "text/csv" });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute("download", `${type}_report_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  },
};

