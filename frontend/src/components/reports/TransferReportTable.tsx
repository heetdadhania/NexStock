import React from "react";
import { Inbox } from "lucide-react";
import type { TransferReportItem } from "@/types/report";

interface Props {
  items: TransferReportItem[];
}

const TRANSFER_STATUS_STYLES: Record<string, string> = {
  requested: "bg-[#FEF3C7] text-[#B45309]",
  approved: "bg-[#DBEAFE] text-[#1D4ED8]",
  in_transit: "bg-[#EDE9FE] text-[#6D28D9]",
  completed: "bg-[#D1FAE5] text-[#065F46]",
  cancelled: "bg-[#FEE2E2] text-[#991B1B]",
};

function TransferStatusBadge({ status }: { status: string }) {
  const style = TRANSFER_STATUS_STYLES[status] ?? "bg-[#F3F4F6] text-[#6B7280]";
  const label = status.replace("_", " ");
  return (
    <span
      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${style}`}
    >
      {label}
    </span>
  );
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });

export default function TransferReportTable({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="bg-white border border-border p-12 rounded-card shadow-minimal text-center flex flex-col items-center justify-center">
        <div className="p-4 rounded-full bg-background text-secondary mb-4">
          <Inbox className="h-10 w-10 text-secondary/60" />
        </div>
        <h3 className="text-lg font-bold text-primary">No Transfers Found</h3>
        <p className="text-sm text-secondary mt-1 max-w-sm">
          No inventory transfers match the selected filters.
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
              {["Transfer #", "Source Warehouse", "Destination", "Status", "Date", "Items"].map(
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
                key={row.transfer_number}
                className="hover:bg-background/40 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">
                  {row.transfer_number}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-primary">
                  {row.source_warehouse}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                  {row.destination_warehouse}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <TransferStatusBadge status={row.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                  {formatDate(row.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-center text-primary">
                  {row.item_count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
