import React from "react";
import { Inbox, Star } from "lucide-react";
import type { SupplierReportItem } from "@/types/report";

interface Props {
  items: SupplierReportItem[];
}

function StarRating({ rating }: { rating: number | null }) {
  if (rating === null) {
    return <span className="text-secondary text-xs italic">No rating</span>;
  }
  const full = Math.floor(rating);
  const partial = rating - full;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full;
        const half = !filled && i === full && partial >= 0.5;
        return (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${
              filled || half ? "text-[#F59E0B] fill-[#F59E0B]" : "text-border fill-border"
            }`}
          />
        );
      })}
      <span className="ml-1 text-xs text-secondary font-medium">{rating.toFixed(1)}</span>
    </div>
  );
}

function ActiveBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-[#D1FAE5] text-[#065F46]">
      Active
    </span>
  ) : (
    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-[#F3F4F6] text-[#6B7280]">
      Inactive
    </span>
  );
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

export default function SupplierReportTable({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="bg-white border border-border p-12 rounded-card shadow-minimal text-center flex flex-col items-center justify-center">
        <div className="p-4 rounded-full bg-background text-secondary mb-4">
          <Inbox className="h-10 w-10 text-secondary/60" />
        </div>
        <h3 className="text-lg font-bold text-primary">No Suppliers Found</h3>
        <p className="text-sm text-secondary mt-1 max-w-sm">
          No supplier records are available yet.
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
              {["Code", "Supplier Name", "Email", "Rating", "Status", "Total Orders", "Total Value"].map(
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
            {items.map((row) => (
              <tr
                key={row.supplier_code}
                className="hover:bg-background/40 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-secondary">
                  {row.supplier_code}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-primary">{row.supplier_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">{row.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StarRating rating={row.rating} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <ActiveBadge isActive={row.is_active} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary text-center">
                  {row.total_orders}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">
                  {formatCurrency(row.total_value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
