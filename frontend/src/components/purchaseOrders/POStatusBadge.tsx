import React from "react";
import type { PurchaseOrderStatus } from "@/types/purchaseOrder";

interface POStatusBadgeProps {
  status: PurchaseOrderStatus;
}

export default function POStatusBadge({ status }: POStatusBadgeProps) {
  const statusStyles = {
    draft: {
      bg: "bg-[#6B7280]/10 text-[#6B7280]",
      dot: "bg-[#6B7280]",
      label: "Draft",
    },
    approved: {
      bg: "bg-[#2563EB]/10 text-[#2563EB]",
      dot: "bg-[#2563EB]",
      label: "Approved",
    },
    received: {
      bg: "bg-[#10B981]/10 text-[#10B981]",
      dot: "bg-[#10B981]",
      label: "Received",
    },
    cancelled: {
      bg: "bg-[#EF4444]/10 text-[#EF4444]",
      dot: "bg-[#EF4444]",
      label: "Cancelled",
    },
  };

  const style = statusStyles[status] || statusStyles.draft;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold select-none ${style.bg}`}
    >
      <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${style.dot}`}></span>
      {style.label}
    </span>
  );
}
