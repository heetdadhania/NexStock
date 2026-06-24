import React, { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { warehouseService } from "@/services/warehouseService";
import { showToast } from "@/components/ui/Toast";
import type { Warehouse } from "@/types/warehouse";

import WarehouseTable from "@/components/warehouses/WarehouseTable";
import WarehouseModal from "@/components/warehouses/WarehouseModal";
import WarehouseForm from "@/components/warehouses/WarehouseForm";

export default function Warehouses() {
  const { user } = useAuth();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const userRole = user?.role || "Viewer";
  const isAdmin = userRole === "Admin";

  const loadWarehouses = async () => {
    setIsLoading(true);
    try {
      const data = await warehouseService.getAll();
      setWarehouses(data);
    } catch (error: any) {
      showToast("error", error.message || "Failed to load warehouses");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  const handleAddClick = () => {
    setSelectedWarehouse(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (values: any) => {
    setActionLoading(true);
    try {
      if (selectedWarehouse) {
        // Edit mode
        await warehouseService.update(selectedWarehouse.id, values);
        showToast("success", `Warehouse "${values.warehouse_name}" updated successfully`);
      } else {
        // Create mode
        await warehouseService.create(values);
        showToast("success", `Warehouse "${values.warehouse_name}" created successfully`);
      }
      setIsModalOpen(false);
      loadWarehouses();
    } catch (error: any) {
      showToast("error", error.message || "Operation failed");
    } finally {
      setActionLoading(false);
    }
  };

  // Search filtering logic
  const filteredWarehouses = warehouses.filter(
    (w) =>
      w.warehouse_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.warehouse_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-primary">Warehouses</h1>
          <p className="text-sm text-secondary mt-1">
            Manage your physical locations, safety stocks, and active inventory hubs.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleAddClick}
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-primary-accent hover:bg-primary-accent/90 rounded-card shadow-minimal transition-all duration-200"
          >
            <Plus className="h-4.5 w-4.5 mr-2" />
            Add Warehouse
          </button>
        )}
      </div>

      {/* Search Bar & Actions */}
      <div className="flex items-center">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-secondary">
            <Search className="h-4.5 w-4.5 text-secondary/60" />
          </span>
          <input
            type="text"
            placeholder="Search by code or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-4 py-2 bg-white border border-border rounded-card text-sm text-primary placeholder:text-secondary/55 focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all duration-200 shadow-minimal"
          />
        </div>
      </div>

      {/* Main Content & Loader skeletons */}
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
                <div className="h-6 bg-background rounded w-2/12 animate-pulse"></div>
                <div className="h-6 bg-background rounded w-1/12 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <WarehouseTable
          warehouses={filteredWarehouses}
          onEdit={handleEditClick}
          currentUserRole={userRole}
        />
      )}

      {/* Create / Edit Modal */}
      <WarehouseModal
        isOpen={isModalOpen}
        title={selectedWarehouse ? "Edit Warehouse" : "Add Warehouse"}
        onClose={() => setIsModalOpen(false)}
      >
        <WarehouseForm
          initialValues={selectedWarehouse}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
          isLoading={actionLoading}
        />
      </WarehouseModal>
    </div>
  );
}
