import React from "react";
import { Link } from "react-router-dom";
import { Edit2, Building2 } from "lucide-react";
import type { Warehouse } from "@/types/warehouse";
import WarehouseStatusBadge from "./WarehouseStatusBadge";

interface WarehouseTableProps {
  warehouses: Warehouse[];
  onEdit: (warehouse: Warehouse) => void;
  currentUserRole?: string;
}

export default function WarehouseTable({
  warehouses,
  onEdit,
  currentUserRole = "Viewer",
}: WarehouseTableProps) {
  const canEdit = currentUserRole === "Admin";

  if (warehouses.length === 0) {
    return (
      <div className="bg-white border border-border p-12 rounded-card shadow-minimal text-center flex flex-col items-center justify-center">
        <div className="p-4 rounded-full bg-background text-secondary mb-4">
          <Building2 className="h-10 w-10 text-secondary/60" />
        </div>
        <h3 className="text-lg font-bold text-primary">No Warehouses Found</h3>
        <p className="text-sm text-secondary mt-1 max-w-sm">
          There are no warehouses registered. Get started by creating your first warehouse.
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
                City
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                Country
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                Contact
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
            {warehouses.map((warehouse) => (
              <tr
                key={warehouse.id}
                className="hover:bg-background/40 transition-colors duration-150"
              >
                {/* Code */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-semibold text-primary">
                  {warehouse.warehouse_code}
                </td>

                {/* Name */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">
                  <Link
                    to={`/warehouses/${warehouse.id}/inventory`}
                    className="text-primary hover:text-primary-accent hover:underline"
                  >
                    {warehouse.warehouse_name}
                  </Link>
                </td>

                {/* City */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                  {warehouse.city}
                </td>

                {/* Country */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                  {warehouse.country}
                </td>

                {/* Contact */}
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {warehouse.contact_person ? (
                    <div>
                      <div className="font-semibold text-primary">{warehouse.contact_person}</div>
                      {(warehouse.contact_email || warehouse.contact_phone) && (
                        <div className="text-xs text-secondary mt-0.5">
                          {warehouse.contact_email}
                          {warehouse.contact_email && warehouse.contact_phone ? " | " : ""}
                          {warehouse.contact_phone}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-secondary/40 italic">No contact info</span>
                  )}
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <WarehouseStatusBadge isActive={warehouse.is_active} />
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <button
                    onClick={() => onEdit(warehouse)}
                    disabled={!canEdit}
                    title={canEdit ? "Edit Warehouse" : "Only Admins can edit warehouses"}
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
