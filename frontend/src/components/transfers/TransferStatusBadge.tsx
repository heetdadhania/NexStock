import React from "react";
import type { TransferStatus } from "@/types/inventoryTransfer";

interface TransferStatusBadgeProps {
  status: TransferStatus;
}

export default function TransferStatusBadge({ status }: TransferStatusBadgeProps) {
  const statusStyles = {
    requested: {
      bg: "bg-[#F59E0B]/10 text-[#F59E0B]",
      dot: "bg-[#F59E0B]",
      label: "Requested",
    },
    approved: {
      bg: "bg-[#2563EB]/10 text-[#2563EB]",
      dot: "bg-[#2563EB]",
      label: "Approved",
    },
    in_transit: {
      bg: "bg-[#8B5CF6]/10 text-[#8B5CF6]",
      dot: "bg-[#8B5CF6]",
      label: "In Transit",
    },
    completed: {
      bg: "bg-[#10B981]/10 text-[#10B981]",
      dot: "bg-[#10B981]",
      label: "Completed",
    },
    cancelled: {
      bg: "bg-[#EF4444]/10 text-[#EF4444]",
      dot: "bg-[#EF4444]",
      label: "Cancelled",
    },
  };

  const style = statusStyles[status] || statusStyles.requested;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold select-none ${style.bg}`}
    >
      <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${style.dot}`}></span>
      {style.label}
    </span>
  );
}
