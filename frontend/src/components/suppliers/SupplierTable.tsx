import React from "react";
import { Edit2, Truck } from "lucide-react";
import type { Supplier } from "@/types/supplier";
import SupplierRating from "./SupplierRating";
import WarehouseStatusBadge from "../warehouses/WarehouseStatusBadge";

interface SupplierTableProps {
  suppliers: Supplier[];
  onEdit: (supplier: Supplier) => void;
  currentUserRole?: string;
}

export default function SupplierTable({
  suppliers,
  onEdit,
  currentUserRole = "Viewer",
}: SupplierTableProps) {
  const canEdit = currentUserRole === "Admin";

  if (suppliers.length === 0) {
    return (
      <div className="bg-white border border-border p-12 rounded-card shadow-minimal text-center flex flex-col items-center justify-center">
        <div className="p-4 rounded-full bg-background text-secondary mb-4">
          <Truck className="h-10 w-10 text-secondary/60" />
        </div>
        <h3 className="text-lg font-bold text-primary">No Suppliers Found</h3>
        <p className="text-sm text-secondary mt-1 max-w-sm">
          There are no suppliers registered. Get started by registering your first supplier.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-card shadow-minimal overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border text-left">
          <thead className="bg-background">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                Code
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                Name
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                Contact
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                Email
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                Phone
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                Rating
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-white">
            {suppliers.map((supplier) => (
              <tr
                key={supplier.id}
                className="hover:bg-background/40 transition-colors duration-150"
              >
                {/* Code */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-semibold text-primary">
                  {supplier.supplier_code}
                </td>

                {/* Name */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">
                  {supplier.supplier_name}
                </td>

                {/* Contact Person */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                  {supplier.contact_person || (
                    <span className="text-secondary/40 italic">N/A</span>
                  )}
                </td>

                {/* Email */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                  {supplier.email}
                </td>

                {/* Phone */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                  {supplier.phone || (
                    <span className="text-secondary/40 italic">N/A</span>
                  )}
                </td>

                {/* Rating */}
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <SupplierRating rating={supplier.rating} />
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <WarehouseStatusBadge isActive={supplier.is_active} />
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <button
                    onClick={() => onEdit(supplier)}
                    disabled={!canEdit}
                    title={canEdit ? "Edit Supplier" : "Only Admins can edit suppliers"}
                    className="inline-flex p-1.5 rounded-card text-secondary hover:text-primary hover:bg-background disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <Edit2 className="h-4.5 w-4.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
