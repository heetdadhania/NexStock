import React from "react";
import { Inbox, CheckCircle } from "lucide-react";
import type { WarehouseInventoryReportItem } from "@/types/report";

interface Props {
  items: WarehouseInventoryReportItem[];
}

function StatusBadge({ isLowStock }: { isLowStock: boolean }) {
  return isLowStock ? (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#B45309]">
      Low Stock
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#D1FAE5] text-[#065F46]">
      In Stock
    </span>
  );
}

export default function WarehouseInventoryReportTable({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="bg-white border border-border p-12 rounded-card shadow-minimal text-center flex flex-col items-center justify-center">
        <div className="p-4 rounded-full bg-background text-secondary mb-4">
          <Inbox className="h-10 w-10 text-secondary/60" />
        </div>
        <h3 className="text-lg font-bold text-primary">No Inventory Records</h3>
        <p className="text-sm text-secondary mt-1 max-w-sm">
          No warehouse inventory records match the selected filters.
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
              {["Warehouse", "Product", "SKU", "Quantity", "Min Qty", "Max Qty", "Status"].map(
                (col) => (
                  <th
                    key={col}
                    className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary whitespace-nowrap"
                  >
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-white">
            {items.map((row, idx) => (
              <tr
                key={idx}
                className={`hover:bg-background/40 transition-colors duration-150 ${
                  row.is_low_stock ? "bg-[#FEF3C7]/30" : ""
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-primary">
                  {row.warehouse_name}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-primary">{row.product_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-secondary">
                  {row.sku}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-center text-primary">
                  {row.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-secondary font-medium">
                  {row.minimum_quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-secondary font-medium">
                  {row.maximum_quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge isLowStock={row.is_low_stock} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
