import React from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowRight } from "lucide-react";
import type { WarehouseInventoryItem } from "@/types/warehouseInventory";

interface LowStockWarehouseWidgetProps {
  items: WarehouseInventoryItem[];
}

export default function LowStockWarehouseWidget({ items }: LowStockWarehouseWidgetProps) {
  // Slice to top 5 alerts to keep layout balanced
  const displayedItems = items.slice(0, 5);

  return (
    <div className="bg-white border border-border p-6 rounded-card shadow-minimal flex flex-col h-full min-h-[350px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h3 className="text-base font-bold text-primary flex items-center">
            <AlertCircle className="h-4.5 w-4.5 text-warning mr-2 shrink-0" />
            Warehouse Low Stock Alerts
          </h3>
          <p className="text-xs text-secondary mt-0.5">
            Products at or below safety stock limits in warehouses.
          </p>
        </div>
        <Link
          to="/warehouses"
          className="text-xs font-bold text-primary-accent hover:underline flex items-center shrink-0"
        >
          View All
          <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Link>
      </div>

      {/* List */}
      <div className="flex-1 mt-4 space-y-4">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-8">
            <div className="p-3 rounded-full bg-success/10 text-success mb-2">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-sm font-semibold text-primary">All Warehouses Normal</p>
            <p className="text-xs text-secondary mt-1 max-w-[200px]">
              No warehouse products are currently running below safety limits.
            </p>
          </div>
        ) : (
          displayedItems.map((item) => {
            const minQty = item.minimum_quantity || 1; // Avoid divide-by-zero
            const percentage = Math.min((item.quantity / minQty) * 100, 100);

            return (
              <div key={item.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="truncate pr-4">
                    <span className="text-primary block truncate font-bold">
                      {item.product_name}
                    </span>
                    <span className="text-secondary/60 text-[10px] uppercase font-bold mt-0.5 block">
                      SKU: {item.product_sku} | WH: {item.warehouse_code}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-error font-extrabold">{item.quantity}</span>
                    <span className="text-secondary"> / {item.minimum_quantity} min</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-error/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-error rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
