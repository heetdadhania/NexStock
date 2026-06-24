import React from "react";
import type { WarehouseInventoryItem } from "@/types/warehouseInventory";
import LowStockBadge from "@/components/inventory/LowStockBadge";

interface WarehouseInventoryTableProps {
  items: WarehouseInventoryItem[];
}

export default function WarehouseInventoryTable({ items }: WarehouseInventoryTableProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white border border-border p-12 rounded-card shadow-minimal text-center flex flex-col items-center justify-center">
        <h3 className="text-lg font-bold text-primary">No Inventory Found</h3>
        <p className="text-sm text-secondary mt-1 max-w-sm">
          This warehouse has no products in inventory.
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
                Product
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                SKU
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
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-white">
            {items.map((item) => (
              <tr
                key={item.id}
                className={`transition-colors duration-150 ${
                  item.is_low_stock
                    ? "bg-[#FEF3C7]/40 hover:bg-[#FEF3C7]/60"
                    : "hover:bg-background/40"
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">
                  {item.product_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-semibold text-secondary">
                  {item.product_sku}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                  {item.category_name || <span className="text-secondary/40 italic">Uncategorized</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-primary font-bold text-center">
                  {item.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary text-center">
                  {item.minimum_quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary text-center">
                  {item.maximum_quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <LowStockBadge isLowStock={item.is_low_stock} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
