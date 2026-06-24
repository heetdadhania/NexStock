import React, { useEffect, useState } from "react";
import { Plus, Search, Filter } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { purchaseOrderService } from "@/services/purchaseOrderService";
import { supplierService } from "@/services/supplierService";
import { warehouseService } from "@/services/warehouseService";
import { productService } from "@/services/productService";
import { showToast } from "@/components/ui/Toast";

import type { PurchaseOrder, PurchaseOrderCreate } from "@/types/purchaseOrder";
import type { Supplier } from "@/types/supplier";
import type { Warehouse } from "@/types/warehouse";
import type { Product } from "@/types/product";

import POTable from "@/components/purchaseOrders/POTable";
import POModal from "@/components/purchaseOrders/POModal";
import POForm from "@/components/purchaseOrders/POForm";

export default function PurchaseOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [supplierFilter, setSupplierFilter] = useState<string>("all");
  const [warehouseFilter, setWarehouseFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const userRole = user?.role || "Viewer";
  const canCreate = userRole === "Admin" || userRole === "Manager";

  const loadPageData = async () => {
    setIsLoading(true);
    try {
      const [fetchedOrders, fetchedSuppliers, fetchedWarehouses, fetchedProducts] =
        await Promise.all([
          purchaseOrderService.getAll(),
          supplierService.getAll(),
          warehouseService.getAll(),
          productService.getAll(),
        ]);

      setOrders(fetchedOrders);
      setSuppliers(fetchedSuppliers);
      setWarehouses(fetchedWarehouses);
      setProducts(fetchedProducts);
    } catch (error: any) {
      showToast("error", error.message || "Failed to load purchase orders data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  const handleCreateSubmit = async (values: PurchaseOrderCreate) => {
    setActionLoading(true);
    try {
      const created = await purchaseOrderService.create(values);
      showToast("success", `Purchase Order "${created.po_number}" created successfully in Draft status`);
      setIsModalOpen(false);
      // Reload list
      const updatedOrders = await purchaseOrderService.getAll();
      setOrders(updatedOrders);
    } catch (error: any) {
      showToast("error", error.message || "Failed to create Purchase Order");
    } finally {
      setActionLoading(false);
    }
  };

  // Filter logic
  const filteredOrders = orders.filter((order) => {
    // Status Filter
    if (statusFilter !== "all" && order.status !== statusFilter) {
      return false;
    }

    // Supplier Filter
    if (supplierFilter !== "all" && order.supplier_id.toString() !== supplierFilter) {
      return false;
    }

    // Warehouse Filter
    if (warehouseFilter !== "all" && order.warehouse_id.toString() !== warehouseFilter) {
      return false;
    }

    // Start Date Filter
    if (startDate) {
      const orderDate = new Date(order.order_date);
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (orderDate < start) return false;
    }

    // End Date Filter
    if (endDate) {
      const orderDate = new Date(order.order_date);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (orderDate > end) return false;
    }

    // Search query on PO Number
    if (
      searchQuery &&
      !order.po_number.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-primary">Purchase Orders</h1>
          <p className="text-sm text-secondary mt-1">
            Manage incoming supply shipments, track status transitions, approve invoices, and receive inventory.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-primary-accent hover:bg-primary-accent/90 rounded-card shadow-minimal transition-all duration-200"
          >
            <Plus className="h-4.5 w-4.5 mr-2" />
            Create PO
          </button>
        )}
      </div>

      {/* Filter panel */}
      <div className="bg-white border border-border p-4 rounded-card shadow-minimal grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Search */}
        <div>
          <label className="block text-xs font-semibold text-primary mb-1.5">Search PO Number</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-secondary">
              <Search className="h-4 w-4 text-secondary/60" />
            </span>
            <input
              type="text"
              placeholder="e.g. PO-2026..."
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
            <option value="draft">Draft</option>
            <option value="approved">Approved</option>
            <option value="received">Received</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Supplier */}
        <div>
          <label className="block text-xs font-semibold text-primary mb-1.5">Supplier</label>
          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="block w-full px-3 py-1.5 bg-background border border-border rounded-card text-xs text-primary focus:outline-none focus:ring-1 focus:ring-primary-accent focus:border-primary-accent transition-all duration-200"
          >
            <option value="all">All Suppliers</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.supplier_name}
              </option>
            ))}
          </select>
        </div>

        {/* Warehouse */}
        <div>
          <label className="block text-xs font-semibold text-primary mb-1.5">Warehouse</label>
          <select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
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

        {/* Dates */}
        <div>
          <label className="block text-xs font-semibold text-primary mb-1.5">Order Date Range</label>
          <div className="flex items-center space-x-1.5">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block w-full px-2 py-1 bg-background border border-border rounded-card text-[10px] text-primary focus:outline-none focus:ring-1 focus:ring-primary-accent transition-all duration-200"
            />
            <span className="text-secondary text-xs">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block w-full px-2 py-1 bg-background border border-border rounded-card text-[10px] text-primary focus:outline-none focus:ring-1 focus:ring-primary-accent transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* Grid Table display / Load states */}
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
        <POTable orders={filteredOrders} />
      )}

      {/* Modal Dialog Form */}
      <POModal
        isOpen={isModalOpen}
        title="Create Purchase Order"
        onClose={() => setIsModalOpen(false)}
      >
        <POForm
          suppliers={suppliers}
          warehouses={warehouses}
          products={products}
          onSubmit={handleCreateSubmit}
          onCancel={() => setIsModalOpen(false)}
          isLoading={actionLoading}
        />
      </POModal>
    </div>
  );
}
