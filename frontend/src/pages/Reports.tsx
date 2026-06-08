import React, { useEffect, useState } from "react";
import { RefreshCw, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { reportService } from "@/services/reportService";
import { categoryService } from "@/services/categoryService";
import { showToast } from "@/components/ui/Toast";

import type { Category } from "@/types/category";
import type {
  InventoryReportItem,
  StockMovementReportItem,
  LowStockReportItem,
} from "@/types/report";

import ExportButton from "@/components/reports/ExportButton";
import ReportFilters from "@/components/reports/ReportFilters";
import InventoryReportTable from "@/components/reports/InventoryReportTable";
import StockMovementReportTable from "@/components/reports/StockMovementReportTable";
import LowStockReportTable from "@/components/reports/LowStockReportTable";

type TabType = "inventory" | "movements" | "low-stock";

export default function Reports() {
  const [activeTab, setActiveTab] = useState<TabType>("inventory");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Data Lists
  const [inventoryReport, setInventoryReport] = useState<InventoryReportItem[]>([]);
  const [movementReport, setMovementReport] = useState<StockMovementReportItem[]>([]);
  const [lowStockReport, setLowStockReport] = useState<LowStockReportItem[]>([]);

  // Filter States
  const [categoryId, setCategoryId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [movementType, setMovementType] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  // Load Categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await categoryService.getAll();
        setCategories(cats);
      } catch (error: any) {
        showToast("error", "Failed to load categories filter");
      }
    };
    loadCategories();
  }, []);

  // Fetch report data depending on active tab
  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === "inventory") {
        const catId = categoryId ? parseInt(categoryId, 10) : undefined;
        const data = await reportService.getInventoryReport(catId);
        setInventoryReport(data);
      } else if (activeTab === "movements") {
        const data = await reportService.getStockMovementReport({
          from_date: fromDate || undefined,
          to_date: toDate || undefined,
          type: (movementType as "IN" | "OUT" | "") || undefined,
        });
        setMovementReport(data);
      } else if (activeTab === "low-stock") {
        const data = await reportService.getLowStockReport();
        setLowStockReport(data);
      }
    } catch (error: any) {
      showToast("error", error.message || "Failed to load report data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [activeTab, categoryId, movementType, fromDate, toDate]);

  // Client-side search matching for movements
  const filteredMovements = React.useMemo(() => {
    if (activeTab !== "movements") return [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return movementReport;
    return movementReport.filter(
      (m) =>
        m.product_name.toLowerCase().includes(q) ||
        m.sku.toLowerCase().includes(q)
    );
  }, [movementReport, searchQuery, activeTab]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setMovementType("");
    setFromDate("");
    setToDate("");
  };

  // CSV Export Trigger
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      if (activeTab === "inventory") {
        const catId = categoryId ? parseInt(categoryId, 10) : undefined;
        await reportService.exportCSV("inventory", { category_id: catId });
      } else if (activeTab === "movements") {
        await reportService.exportCSV("stock-movements", {
          from_date: fromDate || undefined,
          to_date: toDate || undefined,
          type: movementType || undefined,
        });
      } else if (activeTab === "low-stock") {
        await reportService.exportCSV("low-stock");
      }
      showToast("success", "Report downloaded successfully");
    } catch (error: any) {
      showToast("error", error.message || "Failed to download CSV");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-primary">Warehouse Reports</h1>
          <p className="text-sm text-secondary mt-1">
            Analyze asset values, check movements audit trail logs, and download CSV reports.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          {/* Refresh */}
          <button
            onClick={fetchReportData}
            disabled={isLoading}
            className="inline-flex items-center px-3.5 py-2 text-sm font-semibold rounded-card border border-border bg-white text-primary hover:bg-background shadow-minimal transition-all duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          {/* Export */}
          <ExportButton onExport={handleExportCSV} isLoading={isExporting} />
        </div>
      </div>

      {/* Tab controls */}
      <div className="border-b border-border flex space-x-6">
        <button
          onClick={() => setActiveTab("inventory")}
          className={`pb-3 text-sm font-bold border-b-2 transition-all duration-200 ${
            activeTab === "inventory"
              ? "border-primary-accent text-primary-accent font-extrabold"
              : "border-transparent text-secondary hover:text-primary"
          }`}
        >
          Valuation Inventory
        </button>
        <button
          onClick={() => setActiveTab("movements")}
          className={`pb-3 text-sm font-bold border-b-2 transition-all duration-200 ${
            activeTab === "movements"
              ? "border-primary-accent text-primary-accent font-extrabold"
              : "border-transparent text-secondary hover:text-primary"
          }`}
        >
          Stock Movements
        </button>
        <button
          onClick={() => setActiveTab("low-stock")}
          className={`pb-3 text-sm font-bold border-b-2 transition-all duration-200 ${
            activeTab === "low-stock"
              ? "border-primary-accent text-primary-accent font-extrabold"
              : "border-transparent text-secondary hover:text-primary"
          }`}
        >
          Low Stock Warnings
        </button>
      </div>

      {/* Filter Bar */}
      <ReportFilters
        activeTab={activeTab}
        categories={categories}
        categoryId={categoryId}
        onCategoryChange={setCategoryId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        movementType={movementType}
        onMovementTypeChange={setMovementType}
        fromDate={fromDate}
        onFromDateChange={setFromDate}
        toDate={toDate}
        onToDateChange={setToDate}
        onClearFilters={handleClearFilters}
      />

      {/* Data display space */}
      {isLoading ? (
        <div className="bg-white border border-border rounded-card p-6 space-y-4 shadow-minimal animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex justify-between items-center py-3 border-b border-border last:border-0"
            >
              <div className="h-4 bg-background rounded w-1/4"></div>
              <div className="h-4 bg-background rounded w-1/6"></div>
              <div className="h-4 bg-background rounded w-12"></div>
              <div className="h-4 bg-background rounded w-12"></div>
              <div className="h-6 bg-background rounded w-16"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {activeTab === "inventory" && (
            <InventoryReportTable items={inventoryReport} />
          )}
          {activeTab === "movements" && (
            <StockMovementReportTable items={filteredMovements} />
          )}
          {activeTab === "low-stock" && (
            <LowStockReportTable items={lowStockReport} />
          )}
        </>
      )}
    </div>
  );
}
