import React, { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { supplierService } from "@/services/supplierService";
import { showToast } from "@/components/ui/Toast";
import type { Supplier } from "@/types/supplier";

import SupplierTable from "@/components/suppliers/SupplierTable";
import SupplierModal from "@/components/suppliers/SupplierModal";
import SupplierForm from "@/components/suppliers/SupplierForm";

export default function Suppliers() {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const userRole = user?.role || "Viewer";
  const isAdmin = userRole === "Admin";

  const loadSuppliers = async () => {
    setIsLoading(true);
    try {
      const data = await supplierService.getAll();
      setSuppliers(data);
    } catch (error: any) {
      showToast("error", error.message || "Failed to load suppliers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleAddClick = () => {
    setSelectedSupplier(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (values: any) => {
    setActionLoading(true);
    try {
      if (selectedSupplier) {
        // Edit mode
        await supplierService.update(selectedSupplier.id, values);
        showToast("success", `Supplier "${values.supplier_name}" updated successfully`);
      } else {
        // Create mode
        await supplierService.create(values);
        showToast("success", `Supplier "${values.supplier_name}" created successfully`);
      }
      setIsModalOpen(false);
      loadSuppliers();
    } catch (error: any) {
      showToast("error", error.message || "Operation failed");
    } finally {
      setActionLoading(false);
    }
  };

  // Search filtering
  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.supplier_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.supplier_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-primary">Suppliers</h1>
          <p className="text-sm text-secondary mt-1">
            Manage your external vendors, contact information, and supplier performance rankings.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleAddClick}
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-primary-accent hover:bg-primary-accent/90 rounded-card shadow-minimal transition-all duration-200"
          >
            <Plus className="h-4.5 w-4.5 mr-2" />
            Add Supplier
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="flex items-center">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-secondary">
            <Search className="h-4.5 w-4.5 text-secondary/60" />
          </span>
          <input
            type="text"
            placeholder="Search by code, name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-4 py-2 bg-white border border-border rounded-card text-sm text-primary placeholder:text-secondary/55 focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all duration-200 shadow-minimal"
          />
        </div>
      </div>

      {/* Table & Loading Skeletons */}
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
        <SupplierTable
          suppliers={filteredSuppliers}
          onEdit={handleEditClick}
          currentUserRole={userRole}
        />
      )}

      {/* Modal Form */}
      <SupplierModal
        isOpen={isModalOpen}
        title={selectedSupplier ? "Edit Supplier" : "Add Supplier"}
        onClose={() => setIsModalOpen(false)}
      >
        <SupplierForm
          initialValues={selectedSupplier}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
          isLoading={actionLoading}
        />
      </SupplierModal>
    </div>
  );
}
