import React from "react";
import { AlertTriangle } from "lucide-react";
import type { LowStockReportItem } from "@/types/report";

interface LowStockReportTableProps {
  items: LowStockReportItem[];
}

export default function LowStockReportTable({ items }: LowStockReportTableProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white border border-border p-12 rounded-card shadow-minimal text-center flex flex-col items-center justify-center">
        <div className="p-4 rounded-full bg-background text-secondary mb-4">
          <svg
            className="h-10 w-10 text-success/60"
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
        <h3 className="text-lg font-bold text-primary">All Stock Levels Healthy</h3>
        <p className="text-sm text-secondary mt-1 max-w-sm">
          No active products are currently running below safety stock margins.
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
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary text-right">
                Shortage Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-white">
            {items.map((row) => (
              <tr
                key={row.product_id}
                className="hover:bg-background/40 transition-colors duration-150 bg-error/[0.01]"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-secondary">
                  {row.sku}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-primary flex items-center">
                  <AlertTriangle className="h-4 w-4 text-warning mr-2 shrink-0 animate-pulse" />
                  {row.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                  {row.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-error">
                  {row.current_quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-secondary font-medium">
                  {row.minimum_quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-extrabold text-error">
                  {row.shortage} units
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
