import React from "react";
import { Check, PackageOpen, XCircle } from "lucide-react";
import type { PurchaseOrderStatus } from "@/types/purchaseOrder";

interface POActionButtonsProps {
  status: PurchaseOrderStatus;
  currentUserRole: string;
  onApprove: () => Promise<void>;
  onReceive: () => Promise<void>;
  onCancel: () => Promise<void>;
  isLoading?: boolean;
}

export default function POActionButtons({
  status,
  currentUserRole,
  onApprove,
  onReceive,
  onCancel,
  isLoading = false,
}: POActionButtonsProps) {
  const isAdmin = currentUserRole === "Admin";

  if (status === "received" || status === "cancelled") {
    return null;
  }

  return (
    <div className="flex items-center space-x-3">
      {/* Draft Actions */}
      {status === "draft" && (
        <>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex items-center px-4 py-2 text-sm font-semibold rounded-card border border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444]/5 disabled:opacity-40 transition-all duration-200"
          >
            <XCircle className="h-4.5 w-4.5 mr-2" />
            Cancel Order
          </button>
          <button
            onClick={onApprove}
            disabled={isLoading || !isAdmin}
            title={isAdmin ? "Approve Purchase Order" : "Only Admins can approve purchase orders"}
            className="flex items-center px-4 py-2 text-sm font-semibold rounded-card text-white bg-[#2563EB] hover:bg-[#2563EB]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
          >
            <Check className="h-4.5 w-4.5 mr-2" />
            Approve Order
          </button>
        </>
      )}

      {/* Approved Actions */}
      {status === "approved" && (
        <>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex items-center px-4 py-2 text-sm font-semibold rounded-card border border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444]/5 disabled:opacity-40 transition-all duration-200"
          >
            <XCircle className="h-4.5 w-4.5 mr-2" />
            Cancel Order
          </button>
          <button
            onClick={onReceive}
            disabled={isLoading}
            className="flex items-center px-4 py-2 text-sm font-semibold rounded-card text-white bg-[#10B981] hover:bg-[#10B981]/90 disabled:opacity-40 transition-all duration-200"
          >
            <PackageOpen className="h-4.5 w-4.5 mr-2" />
            Receive Stock
          </button>
        </>
      )}
    </div>
  );
}
