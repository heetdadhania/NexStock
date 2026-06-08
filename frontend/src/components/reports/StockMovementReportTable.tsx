import React from "react";
import { History, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import type { StockMovementReportItem } from "@/types/report";

interface StockMovementReportTableProps {
  items: StockMovementReportItem[];
}

export default function StockMovementReportTable({ items }: StockMovementReportTableProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white border border-border p-12 rounded-card shadow-minimal text-center flex flex-col items-center justify-center">
        <div className="p-4 rounded-full bg-background text-secondary mb-4">
          <History className="h-10 w-10 text-secondary/60" />
        </div>
        <h3 className="text-lg font-bold text-primary">No Movements Found</h3>
        <p className="text-sm text-secondary mt-1 max-w-sm">
          No stock movements matched your filter range.
        </p>
      </div>
    );
  }

  const formatTimestamp = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white border border-border rounded-card shadow-minimal overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border text-left">
          <thead className="bg-background">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                Date & Time
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                Product
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                SKU
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary text-center">
                Type
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary text-center">
                Quantity
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                Remarks
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary text-right">
                Created By
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-white">
            {items.map((row, index) => {
              const isIn = row.type === "IN";
              return (
                <tr
                  key={index}
                  className={`hover:bg-background/45 transition-colors duration-150 ${
                    isIn ? "bg-success/[0.02]" : "bg-error/[0.02]"
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary font-medium">
                    {formatTimestamp(row.date)}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-primary">
                    {row.product_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-secondary">
                    {row.sku}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    {isIn ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-success/10 text-success border border-success/20">
                        <ArrowUpRight className="h-3 w-3 mr-0.5" />
                        IN
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-error/10 text-error border border-error/20">
                        <ArrowDownLeft className="h-3 w-3 mr-0.5" />
                        OUT
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-primary">
                    <span className={isIn ? "text-success" : "text-error"}>
                      {isIn ? "+" : "-"}
                      {row.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-secondary max-w-xs truncate font-medium">
                    {row.remarks || <span className="text-secondary/40 italic">No remarks</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-secondary font-bold">
                    User #{row.created_by}
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
