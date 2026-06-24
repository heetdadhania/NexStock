import React from "react";
import { Eye, ArrowRight, ArrowLeftRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { InventoryTransfer } from "@/types/inventoryTransfer";
import TransferStatusBadge from "./TransferStatusBadge";

interface TransferTableProps {
  transfers: InventoryTransfer[];
}

export default function TransferTable({ transfers }: TransferTableProps) {
  const navigate = useNavigate();

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (transfers.length === 0) {
    return (
      <div className="bg-white border border-border p-12 rounded-card shadow-minimal text-center flex flex-col items-center justify-center">
        <div className="p-4 rounded-full bg-background text-secondary mb-4">
          <ArrowLeftRight className="h-10 w-10 text-secondary/60" />
        </div>
        <h3 className="text-lg font-bold text-primary">No Inventory Transfers Found</h3>
        <p className="text-sm text-secondary mt-1 max-w-sm">
          No transfers match your criteria. Add a new inventory transfer to move stock between warehouses.
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
                Transfer #
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                Source Warehouse
              </th>
              <th className="px-2 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                Destination Warehouse
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                Date Placed
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                Items
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-white">
            {transfers.map((t) => (
              <tr
                key={t.id}
                onClick={() => navigate(`/transfers/${t.id}`)}
                className="hover:bg-background/40 cursor-pointer transition-colors duration-150"
              >
                {/* Transfer Number */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-primary-accent">
                  {t.transfer_number}
                </td>

                {/* Source Warehouse */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">
                  {t.source_warehouse_name}
                </td>

                {/* Arrow */}
                <td className="px-2 py-4 whitespace-nowrap text-sm text-secondary">
                  <ArrowRight className="h-4 w-4" />
                </td>

                {/* Destination Warehouse */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">
                  {t.destination_warehouse_name}
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap text-sm" onClick={(e) => e.stopPropagation()}>
                  <TransferStatusBadge status={t.status} />
                </td>

                {/* Date Placed */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                  {formatDate(t.created_at)}
                </td>

                {/* Items count */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-primary font-semibold">
                  {t.item_count}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => navigate(`/transfers/${t.id}`)}
                    title="View Details"
                    className="inline-flex p-1.5 rounded-card text-secondary hover:text-primary hover:bg-background transition-all duration-200"
                  >
                    <Eye className="h-4.5 w-4.5" />
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
