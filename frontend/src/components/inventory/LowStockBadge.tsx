import React from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface LowStockBadgeProps {
  isLowStock: boolean;
  title?: string;
}

export default function LowStockBadge({ isLowStock, title }: LowStockBadgeProps) {
  if (isLowStock) {
    return (
      <span
        title={title || "Low Stock! Below safety threshold"}
        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-warning/10 text-warning border border-warning/20 shadow-sm animate-pulse"
      >
        <AlertTriangle className="h-3.5 w-3.5 mr-1 shrink-0" />
        Low Stock
      </span>
    );
  }

  return (
    <span
      title={title || "Stock levels are healthy"}
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-success/10 text-success border border-success/20 shadow-sm"
    >
      <CheckCircle2 className="h-3.5 w-3.5 mr-1 shrink-0" />
      In Stock
    </span>
  );
}
