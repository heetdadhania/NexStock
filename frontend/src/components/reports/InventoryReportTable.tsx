import React from "react";
import { Inbox } from "lucide-react";
import type { InventoryReportItem } from "@/types/report";
import LowStockBadge from "@/components/inventory/LowStockBadge";

interface InventoryReportTableProps {
  items: InventoryReportItem[];
}

export default function InventoryReportTable({ items }: InventoryReportTableProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white border border-border p-12 rounded-card shadow-minimal text-center flex flex-col items-center justify-center">
        <div className="p-4 rounded-full bg-background text-secondary mb-4">
          <Inbox className="h-10 w-10 text-secondary/60" />
        </div>
        <h3 className="text-lg font-bold text-primary">No Records Found</h3>
        <p className="text-sm text-secondary mt-1 max-w-sm">
          No inventory stock records fit the selected criteria.
        </p>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <div className="bg-white border border-border rounded-card shadow-minimal overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border text-left">
          <thead className="bg-background">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                SKU
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                Product Name
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                Category
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary text-center">
                Current Qty
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary text-center">
                Min Qty
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary text-center">
                Max Qty
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                Unit Price
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                Total Value
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary text-center">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-white">
            {items.map((row) => {
              const isLow = row.status === "Low Stock";
              return (
                <tr
                  key={row.product_id}
                  className={`hover:bg-background/40 transition-colors duration-150 ${
                    isLow ? "bg-[#FEF3C7]/40" : ""
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-secondary">
                    {row.sku}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-primary">
                    {row.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                    {row.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-primary">
                    {row.current_quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-secondary font-medium">
                    {row.minimum_quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-secondary font-medium">
                    {row.maximum_quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-primary font-medium">
                    {formatPrice(row.unit_price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-primary font-bold">
                    {formatPrice(row.total_value)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <LowStockBadge isLowStock={isLow} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
