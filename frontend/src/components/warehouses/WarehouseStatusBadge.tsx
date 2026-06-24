import React from "react";

interface WarehouseStatusBadgeProps {
  isActive: boolean;
}

export default function WarehouseStatusBadge({ isActive }: WarehouseStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold select-none ${
        isActive
          ? "bg-[#10B981]/10 text-[#10B981]"
          : "bg-[#6B7280]/10 text-[#6B7280]"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 mr-1.5 rounded-full ${
          isActive ? "bg-[#10B981]" : "bg-[#6B7280]"
        }`}
      ></span>
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}
