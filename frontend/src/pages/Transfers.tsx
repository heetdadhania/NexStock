import React, { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { inventoryTransferService } from "@/services/inventoryTransferService";
import { warehouseService } from "@/services/warehouseService";
import { productService } from "@/services/productService";
import { showToast } from "@/components/ui/Toast";

import type { InventoryTransfer, TransferCreate } from "@/types/inventoryTransfer";
import type { Warehouse } from "@/types/warehouse";
import type { Product } from "@/types/product";

import TransferTable from "@/components/transfers/TransferTable";
import TransferModal from "@/components/transfers/TransferModal";
import TransferForm from "@/components/transfers/TransferForm";

export default function Transfers() {
  const { user } = useAuth();
  const [transfers, setTransfers] = useState<InventoryTransfer[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [destinationFilter, setDestinationFilter] = useState<string>("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const userRole = user?.role || "Viewer";
  const canCreate = userRole === "Admin" || userRole === "Manager";

  const loadPageData = async () => {
    setIsLoading(true);
    try {
      const [fetchedTransfers, fetchedWarehouses, fetchedProducts] = await Promise.all([
        inventoryTransferService.getAll(),
        warehouseService.getAll(),
        productService.getAll(),
      ]);

      setTransfers(fetchedTransfers);
      setWarehouses(fetchedWarehouses);
      setProducts(fetchedProducts);
    } catch (error: any) {
      showToast("error", error.message || "Failed to load transfers data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  const handleCreateSubmit = async (values: TransferCreate) => {
    setActionLoading(true);
    try {
      const created = await inventoryTransferService.create(values);
      showToast(
        "success",
        `Inventory Transfer "${created.transfer_number}" created in Requested status`
      );
      setIsModalOpen(false);
      // Reload list
      const updatedTransfers = await inventoryTransferService.getAll();
      setTransfers(updatedTransfers);
    } catch (error: any) {
      showToast("error", error.message || "Failed to create inventory transfer");
    } finally {
      setActionLoading(false);
    }
  };

  // Filter logic
  const filteredTransfers = transfers.filter((t) => {
    // Status
    if (statusFilter !== "all" && t.status !== statusFilter) return false;

    // Source Warehouse
    if (sourceFilter !== "all" && t.source_warehouse_id.toString() !== sourceFilter) return false;

    // Destination Warehouse
    if (destinationFilter !== "all" && t.destination_warehouse_id.toString() !== destinationFilter) {
      return false;
    }

    // Search query on transfer number
    if (searchQuery && !t.transfer_number.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-primary">Inventory Transfers</h1>
          <p className="text-sm text-secondary mt-1">
            Move items between stock locations, request internal approvals, and trace stock in transit.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-primary-accent hover:bg-primary-accent/90 rounded-card shadow-minimal transition-all duration-200"
          >
            <Plus className="h-4.5 w-4.5 mr-2" />
            Create Transfer
          </button>
        )}
      </div>

      {/* Filters bar */}
      <div className="bg-white border border-border p-4 rounded-card shadow-minimal grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-xs font-semibold text-primary mb-1.5">Search Transfer #</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-secondary">
              <Search className="h-4 w-4 text-secondary/60" />
            </span>
            <input
              type="text"
              placeholder="e.g. TRF-2026..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-9 pr-3 py-1.5 bg-background border border-border rounded-card text-xs text-primary placeholder:text-secondary/55 focus:outline-none focus:ring-1 focus:ring-primary-accent focus:border-primary-accent transition-all duration-200"
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-semibold text-primary mb-1.5">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full px-3 py-1.5 bg-background border border-border rounded-card text-xs text-primary focus:outline-none focus:ring-1 focus:ring-primary-accent focus:border-primary-accent transition-all duration-200"
          >
            <option value="all">All Statuses</option>
            <option value="requested">Requested</option>
            <option value="approved">Approved</option>
            <option value="in_transit">In Transit</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Source Warehouse */}
        <div>
          <label className="block text-xs font-semibold text-primary mb-1.5">Source Warehouse</label>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="block w-full px-3 py-1.5 bg-background border border-border rounded-card text-xs text-primary focus:outline-none focus:ring-1 focus:ring-primary-accent focus:border-primary-accent transition-all duration-200"
          >
            <option value="all">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.warehouse_name}
              </option>
            ))}
          </select>
        </div>

        {/* Destination Warehouse */}
        <div>
          <label className="block text-xs font-semibold text-primary mb-1.5">Destination Warehouse</label>
          <select
            value={destinationFilter}
            onChange={(e) => setDestinationFilter(e.target.value)}
            className="block w-full px-3 py-1.5 bg-background border border-border rounded-card text-xs text-primary focus:outline-none focus:ring-1 focus:ring-primary-accent focus:border-primary-accent transition-all duration-200"
          >
            <option value="all">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.warehouse_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid Table or loading templates */}
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
                <div className="h-4 bg-background rounded w-2/12 animate-pulse"></div>
                <div className="h-6 bg-background rounded w-1/12 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <TransferTable transfers={filteredTransfers} />
      )}

      {/* Creation Popup */}
      <TransferModal
        isOpen={isModalOpen}
        title="Create Inventory Transfer"
        onClose={() => setIsModalOpen(false)}
      >
        <TransferForm
          warehouses={warehouses}
          products={products}
          onSubmit={handleCreateSubmit}
          onCancel={() => setIsModalOpen(false)}
          isLoading={actionLoading}
        />
      </TransferModal>
    </div>
  );
}
