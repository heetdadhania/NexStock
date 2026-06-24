import React from "react";
import type { TransferItem } from "@/types/inventoryTransfer";

interface TransferItemsTableProps {
  items: TransferItem[];
}

export default function TransferItemsTable({ items }: TransferItemsTableProps) {
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
                Quantity
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-white">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-background/20 transition-colors duration-150">
                {/* Product Name */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">
                  {item.product_name}
                </td>

                {/* SKU */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-secondary">
                  {item.product_sku}
                </td>

                {/* Quantity */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-primary font-semibold">
                  {item.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
