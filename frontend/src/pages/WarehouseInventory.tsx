import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Search, Building } from "lucide-react";

import { warehouseService } from "@/services/warehouseService";
import { warehouseInventoryService } from "@/services/warehouseInventoryService";
import { showToast } from "@/components/ui/Toast";
import type { Warehouse } from "@/types/warehouse";
import type { WarehouseInventoryItem } from "@/types/warehouseInventory";

import WarehouseInventoryTable from "@/components/warehouseInventory/WarehouseInventoryTable";

export default function WarehouseInventory() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [inventoryItems, setInventoryItems] = useState<WarehouseInventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const currentWarehouseId = parseInt(id || "0");

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // Load all warehouses for the dropdown selector
      const warehouseList = await warehouseService.getAll();
      setWarehouses(warehouseList);

      if (currentWarehouseId) {
        // Load inventory for the selected warehouse
        const inventoryData = await warehouseInventoryService.getByWarehouse(currentWarehouseId);
        setInventoryItems(inventoryData);
      }
    } catch (error: any) {
      showToast("error", error.message || "Failed to load inventory data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [id]);

  const handleWarehouseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    navigate(`/warehouses/${newId}/inventory`);
  };

  const currentWarehouse = warehouses.find((w) => w.id === currentWarehouseId);
  const warehouseName = currentWarehouse ? currentWarehouse.warehouse_name : "Warehouse";

  // Search filtering
  const filteredItems = inventoryItems.filter(
    (item) =>
      item.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product_sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Back Button & Top Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          to="/warehouses"
          className="inline-flex items-center text-sm font-semibold text-secondary hover:text-primary transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Warehouses
        </Link>

        {/* Warehouse Dropdown Switcher */}
        {warehouses.length > 0 && (
          <div className="flex items-center space-x-3 bg-white border border-border px-4 py-2 rounded-card shadow-minimal w-fit">
            <Building className="h-4 w-4 text-secondary/60 shrink-0" />
            <label
              htmlFor="warehouse-select"
              className="text-xs font-bold text-secondary uppercase shrink-0 select-none"
            >
              Switch:
            </label>
            <select
              id="warehouse-select"
              value={currentWarehouseId}
              onChange={handleWarehouseChange}
              className="bg-transparent text-sm font-semibold text-primary focus:outline-none cursor-pointer pr-4"
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.warehouse_name} ({w.warehouse_code})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Header section */}
      <div>
        <h1 className="text-xl font-bold text-primary">{warehouseName} — Inventory</h1>
        <p className="text-sm text-secondary mt-1">
          Review stock quantities, thresholds, and safety alerts at this location.
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex items-center">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-secondary">
            <Search className="h-4.5 w-4.5 text-secondary/60" />
          </span>
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-4 py-2 bg-white border border-border rounded-card text-sm text-primary placeholder:text-secondary/55 focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all duration-200 shadow-minimal"
          />
        </div>
      </div>

      {/* Table Content & Loader Skeletons */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-12 bg-white border border-border rounded-card animate-pulse shadow-minimal"></div>
          <div className="bg-white border border-border rounded-card p-6 space-y-4 shadow-minimal">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex justify-between items-center py-3 border-b border-border last:border-0"
              >
                <div className="space-y-2 w-1/3">
                  <div className="h-4 bg-background rounded w-2/3 animate-pulse"></div>
                  <div className="h-3 bg-background rounded w-1/2 animate-pulse"></div>
                </div>
                <div className="h-4 bg-background rounded w-1/12 animate-pulse"></div>
                <div className="h-4 bg-background rounded w-1/12 animate-pulse"></div>
                <div className="h-4 bg-background rounded w-1/12 animate-pulse"></div>
                <div className="h-6 bg-background rounded w-2/12 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <WarehouseInventoryTable items={filteredItems} />
      )}
    </div>
  );
}
