import React from "react";
import { Check, Truck, CheckCircle2, XCircle } from "lucide-react";
import type { TransferStatus } from "@/types/inventoryTransfer";

interface TransferActionButtonsProps {
  status: TransferStatus;
  currentUserRole: string;
  onApprove: () => Promise<void>;
  onShip: () => Promise<void>;
  onComplete: () => Promise<void>;
  onCancel: () => Promise<void>;
  isLoading?: boolean;
}

export default function TransferActionButtons({
  status,
  currentUserRole,
  onApprove,
  onShip,
  onComplete,
  onCancel,
  isLoading = false,
}: TransferActionButtonsProps) {
  const isAdmin = currentUserRole === "Admin";

  if (status === "completed" || status === "cancelled") {
    return null;
  }

  return (
    <div className="flex items-center space-x-3">
      {/* Requested Actions */}
      {status === "requested" && (
        <>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex items-center px-4 py-2 text-sm font-semibold rounded-card border border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444]/5 disabled:opacity-40 transition-all duration-200"
          >
            <XCircle className="h-4.5 w-4.5 mr-2" />
            Cancel Transfer
          </button>
          <button
            onClick={onApprove}
            disabled={isLoading || !isAdmin}
            title={isAdmin ? "Approve Inventory Transfer" : "Only Admins can approve transfers"}
            className="flex items-center px-4 py-2 text-sm font-semibold rounded-card text-white bg-[#2563EB] hover:bg-[#2563EB]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
          >
            <Check className="h-4.5 w-4.5 mr-2" />
            Approve Transfer
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
            Cancel Transfer
          </button>
          <button
            onClick={onShip}
            disabled={isLoading}
            className="flex items-center px-4 py-2 text-sm font-semibold rounded-card text-white bg-[#8B5CF6] hover:bg-[#8B5CF6]/90 disabled:opacity-40 transition-all duration-200"
          >
            <Truck className="h-4.5 w-4.5 mr-2" />
            Mark In Transit
          </button>
        </>
      )}

      {/* In Transit Actions */}
      {status === "in_transit" && (
        <button
          onClick={onComplete}
          disabled={isLoading}
          className="flex items-center px-4 py-2 text-sm font-semibold rounded-card text-white bg-[#10B981] hover:bg-[#10B981]/90 disabled:opacity-40 transition-all duration-200"
        >
          <CheckCircle2 className="h-4.5 w-4.5 mr-2" />
          Complete Transfer
        </button>
      )}
    </div>
  );
}
