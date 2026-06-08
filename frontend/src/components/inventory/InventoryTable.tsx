import React from "react";
import { ArrowUpRight, ArrowDownLeft, Inbox } from "lucide-react";
import type { InventoryItem } from "@/types/inventory";
import LowStockBadge from "./LowStockBadge";

interface InventoryTableProps {
  items: InventoryItem[];
  onStockIn: (item: InventoryItem) => void;
  onStockOut: (item: InventoryItem) => void;
  currentUserRole?: string;
}

export default function InventoryTable({
  items,
  onStockIn,
  onStockOut,
  currentUserRole = "Viewer",
}: InventoryTableProps) {
  const canModify = currentUserRole === "Admin" || currentUserRole === "Manager";

  if (items.length === 0) {
    return (
      <div className="bg-white border border-border p-12 rounded-card shadow-minimal text-center flex flex-col items-center justify-center">
        <div className="p-4 rounded-full bg-background text-secondary mb-4">
          <Inbox className="h-10 w-10 text-secondary/60" />
        </div>
        <h3 className="text-lg font-bold text-primary">No Inventory Items Found</h3>
        <p className="text-sm text-secondary mt-1 max-w-sm">
          No product stocks are registered or match your current filter.
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
                Product Name
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                SKU
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
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary text-center">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-white">
            {items.map((item) => {
              const isLowStock = item.is_low_stock || item.current_quantity <= item.minimum_quantity;
              return (
                <tr
                  key={item.id}
                  className={`hover:bg-background/40 transition-colors duration-150 ${
                    isLowStock ? "bg-[#FEF3C7]/40" : ""
                  }`}
                >
                  <td className="px-6 py-4 text-sm font-semibold text-primary">
                    {item.product_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-secondary">
                    {item.sku}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-primary">
                    <span className={isLowStock ? "text-warning" : "text-primary"}>
                      {item.current_quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-secondary font-medium">
                    {item.minimum_quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-secondary font-medium">
                    {item.maximum_quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <LowStockBadge
                      isLowStock={isLowStock}
                      title={
                        isLowStock
                          ? `Low stock! Current quantity is at or below minimum threshold (${item.minimum_quantity})`
                          : "Stock levels are healthy"
                      }
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-2">
                    {/* Stock In Button */}
                    <button
                      onClick={() => onStockIn(item)}
                      disabled={!canModify}
                      title={canModify ? "Stock In" : "Insufficient privileges to perform stock transactions"}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-card border border-success/30 text-success hover:bg-success/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      <ArrowUpRight className="h-3.5 w-3.5 mr-1 shrink-0" />
                      Stock In
                    </button>

                    {/* Stock Out Button */}
                    <button
                      onClick={() => onStockOut(item)}
                      disabled={!canModify || item.current_quantity === 0}
                      title={
                        !canModify
                          ? "Insufficient privileges to perform stock transactions"
                          : item.current_quantity === 0
                          ? "Product is out of stock"
                          : "Stock Out"
                      }
                      className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-card border border-error/30 text-error hover:bg-error/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      <ArrowDownLeft className="h-3.5 w-3.5 mr-1 shrink-0" />
                      Stock Out
                    </button>
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
