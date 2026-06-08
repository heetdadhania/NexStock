import React, { useEffect, useState, useMemo } from "react";
import { Search, Filter, Calendar, RefreshCw, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { inventoryService } from "@/services/inventoryService";
import { showToast } from "@/components/ui/Toast";

import type { InventoryItem, StockMovement, MovementFilters } from "@/types/inventory";
import InventoryTable from "@/components/inventory/InventoryTable";
import MovementsTable from "@/components/inventory/MovementsTable";
import StockInModal from "@/components/inventory/StockInModal";
import StockOutModal from "@/components/inventory/StockOutModal";

type TabType = "current" | "movements";

export default function Inventory() {
  const { user } = useAuth();
  const currentUserRole = user?.role || "Viewer";

  const [activeTab, setActiveTab] = useState<TabType>("current");
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Search filter for Current Inventory Tab
  const [inventorySearch, setInventorySearch] = useState<string>("");

  // Filters for Stock Movements Tab
  const [movementSearch, setMovementSearch] = useState<string>("");
  const [movementType, setMovementType] = useState<"IN" | "OUT" | "">("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [isStockInOpen, setIsStockInOpen] = useState<boolean>(false);
  const [isStockOutOpen, setIsStockOutOpen] = useState<boolean>(false);

  // Fetch Current Inventory
  const fetchInventory = async () => {
    try {
      const data = await inventoryService.getAll();
      setInventoryItems(data);
    } catch (error: any) {
      showToast("error", error.message || "Failed to load inventory levels");
    }
  };

  // Fetch Stock Movements based on filters
  const fetchMovements = async () => {
    try {
      const filters: MovementFilters = {};
      if (movementType) filters.type = movementType;
      if (fromDate) filters.from_date = fromDate;
      if (toDate) filters.to_date = toDate;

      const data = await inventoryService.getMovements(filters);
      setMovements(data);
    } catch (error: any) {
      showToast("error", error.message || "Failed to load stock movements");
    }
  };

  // Load all initial page data
  const loadAllData = async () => {
    setIsLoading(true);
    await Promise.all([fetchInventory(), fetchMovements()]);
    setIsLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, [movementType, fromDate, toDate]);

  // Client-side filtering for Inventory items (search by SKU or product name)
  const filteredInventoryItems = useMemo(() => {
    const q = inventorySearch.trim().toLowerCase();
    if (!q) return inventoryItems;
    return inventoryItems.filter(
      (item) =>
        item.product_name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q)
    );
  }, [inventoryItems, inventorySearch]);

  // Client-side searching for movements by product name or SKU
  const filteredMovements = useMemo(() => {
    const q = movementSearch.trim().toLowerCase();
    if (!q) return movements;
    return movements.filter(
      (m) =>
        m.product_name.toLowerCase().includes(q) ||
        m.sku.toLowerCase().includes(q)
    );
  }, [movements, movementSearch]);

  // Handlers for starting stock transaction modals
  const handleStockInClick = (item: InventoryItem) => {
    setSelectedProduct(item);
    setIsStockInOpen(true);
  };

  const handleStockOutClick = (item: InventoryItem) => {
    setSelectedProduct(item);
    setIsStockOutOpen(true);
  };

  // Refresh everything after a successful transaction
  const handleTransactionSuccess = async () => {
    await loadAllData();
  };

  // Reset filters helper for Movements
  const handleResetMovementsFilters = () => {
    setMovementSearch("");
    setMovementType("");
    setFromDate("");
    setToDate("");
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-primary">Inventory Management</h1>
          <p className="text-sm text-secondary mt-1">
            Monitor stock thresholds, log receipts (Stock In), log dispatches (Stock Out), and track changes.
          </p>
        </div>

        <button
          onClick={loadAllData}
          disabled={isLoading}
          className="inline-flex items-center self-start sm:self-auto px-3.5 py-2 text-sm font-semibold rounded-card border border-border bg-white text-primary hover:bg-background shadow-minimal transition-all duration-200 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Tab controls */}
      <div className="border-b border-border flex space-x-6">
        <button
          onClick={() => setActiveTab("current")}
          className={`pb-3 text-sm font-bold border-b-2 transition-all duration-200 relative ${
            activeTab === "current"
              ? "border-primary-accent text-primary-accent font-extrabold"
              : "border-transparent text-secondary hover:text-primary"
          }`}
        >
          Current Inventory
          {inventoryItems.some(item => item.is_low_stock) && (
            <span className="ml-2 inline-block h-2 w-2 rounded-full bg-warning animate-pulse" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("movements")}
          className={`pb-3 text-sm font-bold border-b-2 transition-all duration-200 ${
            activeTab === "movements"
              ? "border-primary-accent text-primary-accent font-extrabold"
              : "border-transparent text-secondary hover:text-primary"
          }`}
        >
          Stock Movements Log
        </button>
      </div>

      {/* Tab content space */}
      {activeTab === "current" ? (
        <div className="space-y-4">
          {/* Inventory Tab Filters */}
          <div className="bg-white border border-border p-4 rounded-card shadow-minimal flex items-center">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary">
                <Search className="h-4.5 w-4.5" />
              </div>
              <input
                type="text"
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                placeholder="Search inventory by Product Name or SKU..."
                className="block w-full pl-10 pr-4 py-2 bg-background border border-border rounded-card text-sm text-primary placeholder:text-secondary/55 focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all duration-200"
              />
            </div>
          </div>

          {/* Table display */}
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
            <InventoryTable
              items={filteredInventoryItems}
              onStockIn={handleStockInClick}
              onStockOut={handleStockOutClick}
              currentUserRole={currentUserRole}
            />
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Movements Tab Filters */}
          <div className="bg-white border border-border p-4 rounded-card shadow-minimal grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            {/* Search Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider">
                Product Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                  <Search className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={movementSearch}
                  onChange={(e) => setMovementSearch(e.target.value)}
                  placeholder="SKU or Product..."
                  className="block w-full pl-9 pr-3 py-2 bg-background border border-border rounded-card text-xs text-primary focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all duration-200"
                />
              </div>
            </div>

            {/* Type Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider">
                Movement Type
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                  <Filter className="h-4 w-4" />
                </div>
                <select
                  value={movementType}
                  onChange={(e) => setMovementType(e.target.value as "IN" | "OUT" | "")}
                  className="block w-full pl-9 pr-8 py-2 bg-background border border-border rounded-card text-xs text-primary focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="">All Types</option>
                  <option value="IN">IN (Receipts)</option>
                  <option value="OUT">OUT (Dispatches)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-secondary">
                  <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* From Date */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider">
                From Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                  <Calendar className="h-4 w-4" />
                </div>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 bg-background border border-border rounded-card text-xs text-primary focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all duration-200"
                />
              </div>
            </div>

            {/* To Date & Reset Button Wrapper */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
              <div className="sm:col-span-3 space-y-1.5">
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider">
                  To Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 bg-background border border-border rounded-card text-xs text-primary focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all duration-200"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <button
                  onClick={handleResetMovementsFilters}
                  className="w-full py-2 bg-background border border-border rounded-card text-xs font-semibold text-secondary hover:text-primary hover:bg-background transition-all duration-200"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Table display */}
          {isLoading ? (
            <div className="bg-white border border-border rounded-card p-6 space-y-4 shadow-minimal animate-pulse">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex justify-between items-center py-3 border-b border-border last:border-0"
                >
                  <div className="h-4 bg-background rounded w-1/5"></div>
                  <div className="h-4 bg-background rounded w-1/4"></div>
                  <div className="h-4 bg-background rounded w-12"></div>
                  <div className="h-4 bg-background rounded w-8"></div>
                  <div className="h-4 bg-background rounded w-1/6"></div>
                </div>
              ))}
            </div>
          ) : (
            <MovementsTable movements={filteredMovements} />
          )}
        </div>
      )}

      {/* Stock In Transaction Modal */}
      <StockInModal
        isOpen={isStockInOpen}
        product={selectedProduct}
        onClose={() => {
          setIsStockInOpen(false);
          setSelectedProduct(null);
        }}
        onSuccess={handleTransactionSuccess}
      />

      {/* Stock Out Transaction Modal */}
      <StockOutModal
        isOpen={isStockOutOpen}
        product={selectedProduct}
        onClose={() => {
          setIsStockOutOpen(false);
          setSelectedProduct(null);
        }}
        onSuccess={handleTransactionSuccess}
      />
    </div>
  );
}
