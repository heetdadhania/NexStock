import React, { useEffect, useMemo, useState } from "react";
import { RefreshCw, Filter, Calendar, ToggleLeft, ToggleRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { reportService } from "@/services/reportService";
import { categoryService } from "@/services/categoryService";
import { warehouseService } from "@/services/warehouseService";
import { supplierService } from "@/services/supplierService";
import { showToast } from "@/components/ui/Toast";

import type { Category } from "@/types/category";
import type { Warehouse } from "@/types/warehouse";
import type { Supplier } from "@/types/supplier";
import type {
  InventoryReportItem,
  StockMovementReportItem,
  LowStockReportItem,
  WarehouseInventoryReportItem,
  SupplierReportItem,
  PurchaseOrderReportItem,
  TransferReportItem,
} from "@/types/report";

import ExportButton from "@/components/reports/ExportButton";
import ReportFilters from "@/components/reports/ReportFilters";
import InventoryReportTable from "@/components/reports/InventoryReportTable";
import StockMovementReportTable from "@/components/reports/StockMovementReportTable";
import LowStockReportTable from "@/components/reports/LowStockReportTable";
import WarehouseInventoryReportTable from "@/components/reports/WarehouseInventoryReportTable";
import SupplierReportTable from "@/components/reports/SupplierReportTable";
import PurchaseOrderReportTable from "@/components/reports/PurchaseOrderReportTable";
import TransferReportTable from "@/components/reports/TransferReportTable";

type TabType =
  | "inventory"
  | "movements"
  | "low-stock"
  | "warehouse-inventory"
  | "suppliers"
  | "purchase-orders"
  | "transfers";

const TABS: { id: TabType; label: string }[] = [
  { id: "inventory", label: "Valuation Inventory" },
  { id: "movements", label: "Stock Movements" },
  { id: "low-stock", label: "Low Stock Warnings" },
  { id: "warehouse-inventory", label: "Warehouse Inventory" },
  { id: "suppliers", label: "Suppliers" },
  { id: "purchase-orders", label: "Purchase Orders" },
  { id: "transfers", label: "Transfers" },
];

// ─── Shared select style ────────────────────────────────────────────────────
const selectCls =
  "block w-full pl-9 pr-8 py-2 bg-background border border-border rounded-card text-xs text-primary focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all duration-200 appearance-none cursor-pointer";
const inputCls =
  "block w-full pl-9 pr-3 py-2 bg-background border border-border rounded-card text-xs text-primary focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all duration-200";
const labelCls = "block text-xs font-bold text-secondary uppercase tracking-wider mb-1";
const chevronEl = (
  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-secondary">
    <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
    </svg>
  </div>
);

export default function Reports() {
  const [activeTab, setActiveTab] = useState<TabType>("inventory");
  const [categories, setCategories] = useState<Category[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // ── V1 data ──────────────────────────────────────────────────────────────
  const [inventoryReport, setInventoryReport] = useState<InventoryReportItem[]>([]);
  const [movementReport, setMovementReport] = useState<StockMovementReportItem[]>([]);
  const [lowStockReport, setLowStockReport] = useState<LowStockReportItem[]>([]);

  // ── V2 data ──────────────────────────────────────────────────────────────
  const [warehouseInventoryReport, setWarehouseInventoryReport] = useState<WarehouseInventoryReportItem[]>([]);
  const [supplierReport, setSupplierReport] = useState<SupplierReportItem[]>([]);
  const [poReport, setPoReport] = useState<PurchaseOrderReportItem[]>([]);
  const [transferReport, setTransferReport] = useState<TransferReportItem[]>([]);

  // ── V1 filter states ─────────────────────────────────────────────────────
  const [categoryId, setCategoryId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [movementType, setMovementType] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  // ── V2 filter states ─────────────────────────────────────────────────────
  const [whInvWarehouseId, setWhInvWarehouseId] = useState<string>("");
  const [whInvLowStockOnly, setWhInvLowStockOnly] = useState<boolean>(false);

  const [poStatus, setPoStatus] = useState<string>("");
  const [poSupplierId, setPoSupplierId] = useState<string>("");
  const [poWarehouseId, setPoWarehouseId] = useState<string>("");
  const [poFromDate, setPoFromDate] = useState<string>("");
  const [poToDate, setPoToDate] = useState<string>("");

  const [trStatus, setTrStatus] = useState<string>("");
  const [trSourceId, setTrSourceId] = useState<string>("");
  const [trDestId, setTrDestId] = useState<string>("");

  // ── Bootstrap reference data ──────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [cats, whs, sups] = await Promise.all([
          categoryService.getAll(),
          warehouseService.getAll(),
          supplierService.getAll(),
        ]);
        setCategories(cats);
        setWarehouses(whs);
        setSuppliers(sups);
      } catch {
        showToast("error", "Failed to load filter data");
      }
    };
    load();
  }, []);

  // ── Fetch report data on tab / filter change ──────────────────────────────
  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      switch (activeTab) {
        case "inventory": {
          const catId = categoryId ? parseInt(categoryId, 10) : undefined;
          setInventoryReport(await reportService.getInventoryReport(catId));
          break;
        }
        case "movements": {
          setMovementReport(
            await reportService.getStockMovementReport({
              from_date: fromDate || undefined,
              to_date: toDate || undefined,
              type: (movementType as "IN" | "OUT" | "") || undefined,
            })
          );
          break;
        }
        case "low-stock":
          setLowStockReport(await reportService.getLowStockReport());
          break;
        case "warehouse-inventory":
          setWarehouseInventoryReport(
            await reportService.getWarehouseInventoryReport({
              warehouse_id: whInvWarehouseId ? parseInt(whInvWarehouseId, 10) : undefined,
              low_stock_only: whInvLowStockOnly,
            })
          );
          break;
        case "suppliers":
          setSupplierReport(await reportService.getSupplierReport());
          break;
        case "purchase-orders":
          setPoReport(
            await reportService.getPurchaseOrderReport({
              status: poStatus || undefined,
              supplier_id: poSupplierId ? parseInt(poSupplierId, 10) : undefined,
              warehouse_id: poWarehouseId ? parseInt(poWarehouseId, 10) : undefined,
              from_date: poFromDate || undefined,
              to_date: poToDate || undefined,
            })
          );
          break;
        case "transfers":
          setTransferReport(
            await reportService.getTransferReport({
              status: trStatus || undefined,
              source_warehouse_id: trSourceId ? parseInt(trSourceId, 10) : undefined,
              destination_warehouse_id: trDestId ? parseInt(trDestId, 10) : undefined,
            })
          );
          break;
      }
    } catch (error: any) {
      showToast("error", error.message || "Failed to load report data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [
    activeTab,
    categoryId, movementType, fromDate, toDate,
    whInvWarehouseId, whInvLowStockOnly,
    poStatus, poSupplierId, poWarehouseId, poFromDate, poToDate,
    trStatus, trSourceId, trDestId,
  ]);

  // ── Client-side search for movements ─────────────────────────────────────
  const filteredMovements = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return movementReport;
    return movementReport.filter(
      (m) =>
        m.product_name.toLowerCase().includes(q) || m.sku.toLowerCase().includes(q)
    );
  }, [movementReport, searchQuery]);

  const handleClearFilters = () => {
    setSearchQuery(""); setMovementType(""); setFromDate(""); setToDate("");
  };

  // ── CSV export ────────────────────────────────────────────────────────────
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      switch (activeTab) {
        case "inventory":
          await reportService.exportCSV("inventory", {
            category_id: categoryId ? parseInt(categoryId, 10) : undefined,
          });
          break;
        case "movements":
          await reportService.exportCSV("stock-movements", {
            from_date: fromDate || undefined,
            to_date: toDate || undefined,
            type: movementType || undefined,
          });
          break;
        case "low-stock":
          await reportService.exportCSV("low-stock");
          break;
        case "warehouse-inventory":
          await reportService.exportV2CSV("warehouse-inventory", {
            warehouse_id: whInvWarehouseId || undefined,
            low_stock_only: whInvLowStockOnly || undefined,
          });
          break;
        case "suppliers":
          await reportService.exportV2CSV("suppliers");
          break;
        case "purchase-orders":
          await reportService.exportV2CSV("purchase-orders", {
            status: poStatus || undefined,
            supplier_id: poSupplierId || undefined,
            warehouse_id: poWarehouseId || undefined,
            from_date: poFromDate || undefined,
            to_date: poToDate || undefined,
          });
          break;
        case "transfers":
          await reportService.exportV2CSV("transfers", {
            status: trStatus || undefined,
            source_warehouse_id: trSourceId || undefined,
            destination_warehouse_id: trDestId || undefined,
          });
          break;
      }
      showToast("success", "Report downloaded successfully");
    } catch (error: any) {
      showToast("error", error.message || "Failed to download CSV");
    } finally {
      setIsExporting(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const isV1Tab = ["inventory", "movements", "low-stock"].includes(activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-primary">Warehouse Reports</h1>
          <p className="text-sm text-secondary mt-1">
            Analyze asset values, check movements audit trail logs, and download CSV reports.
          </p>
        </div>
        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <button
            onClick={fetchReportData}
            disabled={isLoading}
            className="inline-flex items-center px-3.5 py-2 text-sm font-semibold rounded-card border border-border bg-white text-primary hover:bg-background shadow-minimal transition-all duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <ExportButton onExport={handleExportCSV} isLoading={isExporting} />
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-b border-border flex space-x-6 overflow-x-auto pb-px">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-sm font-bold border-b-2 whitespace-nowrap transition-all duration-200 ${
              activeTab === tab.id
                ? "border-primary-accent text-primary-accent font-extrabold"
                : "border-transparent text-secondary hover:text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* V1 filters (unchanged behaviour) */}
      {isV1Tab && (
        <ReportFilters
          activeTab={activeTab as "inventory" | "movements" | "low-stock"}
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
      )}

      {/* V2 — Warehouse Inventory filters */}
      {activeTab === "warehouse-inventory" && (
        <div className="bg-white border border-border p-4 rounded-card shadow-minimal flex flex-wrap gap-4 items-end">
          {/* Warehouse selector */}
          <div className="w-56 space-y-1">
            <label className={labelCls}>Warehouse</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                <Filter className="h-4 w-4" />
              </div>
              <select
                value={whInvWarehouseId}
                onChange={(e) => setWhInvWarehouseId(e.target.value)}
                className={selectCls}
              >
                <option value="">All Warehouses</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id.toString()}>
                    {w.warehouse_name}
                  </option>
                ))}
              </select>
              {chevronEl}
            </div>
          </div>

          {/* Low stock toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWhInvLowStockOnly((v) => !v)}
              className="flex items-center gap-2 text-sm font-semibold text-primary"
            >
              {whInvLowStockOnly ? (
                <ToggleRight className="h-5 w-5 text-primary-accent" />
              ) : (
                <ToggleLeft className="h-5 w-5 text-secondary" />
              )}
              Low Stock Only
            </button>
          </div>

          <button
            onClick={() => { setWhInvWarehouseId(""); setWhInvLowStockOnly(false); }}
            className="py-2 px-4 bg-background border border-border rounded-card text-xs font-semibold text-secondary hover:text-primary transition-all duration-200"
          >
            Clear
          </button>
        </div>
      )}

      {/* V2 — Purchase Orders filters */}
      {activeTab === "purchase-orders" && (
        <div className="bg-white border border-border p-4 rounded-card shadow-minimal grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          {/* Status */}
          <div className="space-y-1">
            <label className={labelCls}>Status</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                <Filter className="h-4 w-4" />
              </div>
              <select value={poStatus} onChange={(e) => setPoStatus(e.target.value)} className={selectCls}>
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="approved">Approved</option>
                <option value="received">Received</option>
                <option value="cancelled">Cancelled</option>
              </select>
              {chevronEl}
            </div>
          </div>
          {/* Supplier */}
          <div className="space-y-1">
            <label className={labelCls}>Supplier</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                <Filter className="h-4 w-4" />
              </div>
              <select value={poSupplierId} onChange={(e) => setPoSupplierId(e.target.value)} className={selectCls}>
                <option value="">All Suppliers</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id.toString()}>{s.supplier_name}</option>
                ))}
              </select>
              {chevronEl}
            </div>
          </div>
          {/* Warehouse */}
          <div className="space-y-1">
            <label className={labelCls}>Warehouse</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                <Filter className="h-4 w-4" />
              </div>
              <select value={poWarehouseId} onChange={(e) => setPoWarehouseId(e.target.value)} className={selectCls}>
                <option value="">All Warehouses</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id.toString()}>{w.warehouse_name}</option>
                ))}
              </select>
              {chevronEl}
            </div>
          </div>
          {/* From date */}
          <div className="space-y-1">
            <label className={labelCls}>From Date</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                <Calendar className="h-4 w-4" />
              </div>
              <input type="date" value={poFromDate} onChange={(e) => setPoFromDate(e.target.value)} className={inputCls} />
            </div>
          </div>
          {/* To date */}
          <div className="space-y-1">
            <label className={labelCls}>To Date</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                <Calendar className="h-4 w-4" />
              </div>
              <input type="date" value={poToDate} onChange={(e) => setPoToDate(e.target.value)} className={inputCls} />
            </div>
          </div>
          {/* Clear */}
          <div>
            <button
              onClick={() => { setPoStatus(""); setPoSupplierId(""); setPoWarehouseId(""); setPoFromDate(""); setPoToDate(""); }}
              className="w-full py-2 bg-background border border-border rounded-card text-xs font-semibold text-secondary hover:text-primary transition-all duration-200"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* V2 — Transfers filters */}
      {activeTab === "transfers" && (
        <div className="bg-white border border-border p-4 rounded-card shadow-minimal grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          {/* Status */}
          <div className="space-y-1">
            <label className={labelCls}>Status</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                <Filter className="h-4 w-4" />
              </div>
              <select value={trStatus} onChange={(e) => setTrStatus(e.target.value)} className={selectCls}>
                <option value="">All Statuses</option>
                <option value="requested">Requested</option>
                <option value="approved">Approved</option>
                <option value="in_transit">In Transit</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              {chevronEl}
            </div>
          </div>
          {/* Source warehouse */}
          <div className="space-y-1">
            <label className={labelCls}>Source Warehouse</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                <Filter className="h-4 w-4" />
              </div>
              <select value={trSourceId} onChange={(e) => setTrSourceId(e.target.value)} className={selectCls}>
                <option value="">All</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id.toString()}>{w.warehouse_name}</option>
                ))}
              </select>
              {chevronEl}
            </div>
          </div>
          {/* Destination warehouse */}
          <div className="space-y-1">
            <label className={labelCls}>Destination Warehouse</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                <Filter className="h-4 w-4" />
              </div>
              <select value={trDestId} onChange={(e) => setTrDestId(e.target.value)} className={selectCls}>
                <option value="">All</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id.toString()}>{w.warehouse_name}</option>
                ))}
              </select>
              {chevronEl}
            </div>
          </div>
          {/* Clear */}
          <div>
            <button
              onClick={() => { setTrStatus(""); setTrSourceId(""); setTrDestId(""); }}
              className="w-full py-2 bg-background border border-border rounded-card text-xs font-semibold text-secondary hover:text-primary transition-all duration-200"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Data display */}
      {isLoading ? (
        <div className="bg-white border border-border rounded-card p-6 space-y-4 shadow-minimal animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex justify-between items-center py-3 border-b border-border last:border-0">
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
          {activeTab === "inventory" && <InventoryReportTable items={inventoryReport} />}
          {activeTab === "movements" && <StockMovementReportTable items={filteredMovements} />}
          {activeTab === "low-stock" && <LowStockReportTable items={lowStockReport} />}
          {activeTab === "warehouse-inventory" && (
            <WarehouseInventoryReportTable items={warehouseInventoryReport} />
          )}
          {activeTab === "suppliers" && <SupplierReportTable items={supplierReport} />}
          {activeTab === "purchase-orders" && <PurchaseOrderReportTable items={poReport} />}
          {activeTab === "transfers" && <TransferReportTable items={transferReport} />}
        </>
      )}
    </div>
  );
}
