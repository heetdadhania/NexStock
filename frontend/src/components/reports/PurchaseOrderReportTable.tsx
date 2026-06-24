import React from "react";
import { Inbox } from "lucide-react";
import type { PurchaseOrderReportItem } from "@/types/report";

interface Props {
  items: PurchaseOrderReportItem[];
}

const PO_STATUS_STYLES: Record<string, string> = {
  draft: "bg-[#F3F4F6] text-[#6B7280]",
  approved: "bg-[#DBEAFE] text-[#1D4ED8]",
  received: "bg-[#D1FAE5] text-[#065F46]",
  cancelled: "bg-[#FEE2E2] text-[#991B1B]",
};

function POStatusBadge({ status }: { status: string }) {
  const style = PO_STATUS_STYLES[status] ?? "bg-[#F3F4F6] text-[#6B7280]";
  return (
    <span
      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${style}`}
    >
      {status}
    </span>
  );
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

export default function PurchaseOrderReportTable({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="bg-white border border-border p-12 rounded-card shadow-minimal text-center flex flex-col items-center justify-center">
        <div className="p-4 rounded-full bg-background text-secondary mb-4">
          <Inbox className="h-10 w-10 text-secondary/60" />
        </div>
        <h3 className="text-lg font-bold text-primary">No Purchase Orders Found</h3>
        <p className="text-sm text-secondary mt-1 max-w-sm">
          No purchase orders match the selected filters.
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
              {["PO Number", "Supplier", "Warehouse", "Status", "Order Date", "Items", "Total Value"].map(
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
                key={row.po_number}
                className="hover:bg-background/40 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">
                  {row.po_number}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-primary">{row.supplier_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                  {row.warehouse_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <POStatusBadge status={row.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                  {formatDate(row.order_date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-center text-primary">
                  {row.item_count}
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
