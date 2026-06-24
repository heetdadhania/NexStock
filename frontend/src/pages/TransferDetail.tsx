import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, User, Building, FileText, ArrowRight } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { inventoryTransferService } from "@/services/inventoryTransferService";
import { showToast } from "@/components/ui/Toast";
import type { InventoryTransfer } from "@/types/inventoryTransfer";

import TransferStatusBadge from "@/components/transfers/TransferStatusBadge";
import TransferItemsTable from "@/components/transfers/TransferItemsTable";
import TransferActionButtons from "@/components/transfers/TransferActionButtons";

export default function TransferDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [transfer, setTransfer] = useState<InventoryTransfer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const currentUserRole = user?.role || "Viewer";
  const transferId = id ? parseInt(id, 10) : 0;

  const loadTransferDetail = async () => {
    setIsLoading(true);
    try {
      const data = await inventoryTransferService.getById(transferId);
      setTransfer(data);
    } catch (error: any) {
      showToast("error", error.message || "Failed to load transfer details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (transferId) {
      loadTransferDetail();
    }
  }, [transferId]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const updated = await inventoryTransferService.approve(transferId);
      showToast("success", `Transfer "${updated.transfer_number}" approved successfully`);
      setTransfer(updated);
    } catch (error: any) {
      showToast("error", error.message || "Approval failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleShip = async () => {
    setActionLoading(true);
    try {
      const updated = await inventoryTransferService.ship(transferId);
      showToast("success", `Transfer "${updated.transfer_number}" is now in transit`);
      setTransfer(updated);
    } catch (error: any) {
      showToast("error", error.message || "Shipping failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    setActionLoading(true);
    try {
      const updated = await inventoryTransferService.complete(transferId);
      showToast(
        "success",
        `Transfer "${updated.transfer_number}" completed. Inventories updated.`
      );
      setTransfer(updated);
    } catch (error: any) {
      showToast("error", error.message || "Completion failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      const updated = await inventoryTransferService.cancel(transferId);
      showToast("success", `Transfer "${updated.transfer_number}" cancelled successfully`);
      setTransfer(updated);
    } catch (error: any) {
      showToast("error", error.message || "Cancellation failed");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Back Link skeleton */}
        <div className="h-5 bg-background rounded w-24 animate-pulse"></div>

        {/* Header skeleton */}
        <div className="flex justify-between items-center bg-white border border-border p-6 rounded-card shadow-minimal">
          <div className="space-y-2 w-1/3">
            <div className="h-6 bg-background rounded w-2/3 animate-pulse"></div>
            <div className="h-4 bg-background rounded w-1/2 animate-pulse"></div>
          </div>
          <div className="h-8 bg-background rounded w-24 animate-pulse"></div>
        </div>

        {/* Info Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 bg-white border border-border rounded-card animate-pulse shadow-minimal"
            ></div>
          ))}
        </div>

        {/* Items Table skeleton */}
        <div className="bg-white border border-border rounded-card p-6 space-y-4 shadow-minimal">
          <div className="h-6 bg-background rounded w-1/4 animate-pulse mb-4"></div>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex justify-between py-3 border-b border-border last:border-0"
            >
              <div className="h-4 bg-background rounded w-1/3 animate-pulse"></div>
              <div className="h-4 bg-background rounded w-1/12 animate-pulse"></div>
              <div className="h-4 bg-background rounded w-1/12 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!transfer) {
    return (
      <div className="text-center p-12 space-y-4 bg-white border border-border rounded-card shadow-minimal">
        <h3 className="text-lg font-bold text-primary">Inventory Transfer Not Found</h3>
        <p className="text-sm text-secondary">
          The transfer order you are looking for does not exist or was deleted.
        </p>
        <button
          onClick={() => navigate("/transfers")}
          className="inline-flex items-center text-sm font-semibold text-primary-accent hover:underline"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to list
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate("/transfers")}
          className="inline-flex items-center text-xs font-semibold text-secondary hover:text-primary transition-colors duration-150"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Inventory Transfers
        </button>
      </div>

      {/* Main Header bar */}
      <div className="bg-white border border-border p-6 rounded-card shadow-minimal flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-3">
          <FileText className="h-8 w-8 text-primary-accent" />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-mono font-bold text-primary leading-none">
                {transfer.transfer_number}
              </h1>
              <TransferStatusBadge status={transfer.status} />
            </div>
            <p className="text-xs text-secondary mt-1">
              Initiated on {formatDate(transfer.created_at)}
            </p>
          </div>
        </div>

        {/* Dynamic actions block */}
        <TransferActionButtons
          status={transfer.status}
          currentUserRole={currentUserRole}
          onApprove={handleApprove}
          onShip={handleShip}
          onComplete={handleComplete}
          onCancel={handleCancel}
          isLoading={actionLoading}
        />
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Source Warehouse Info */}
        <div className="bg-white border border-border p-4 rounded-card shadow-minimal flex items-center space-x-3">
          <div className="p-2.5 bg-background text-primary-accent rounded-card">
            <Building className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
              Source Warehouse
            </p>
            <p className="text-sm font-bold text-primary truncate mt-0.5">
              {transfer.source_warehouse_name}
            </p>
          </div>
        </div>

        {/* Destination Warehouse Info */}
        <div className="bg-white border border-border p-4 rounded-card shadow-minimal flex items-center space-x-3">
          <div className="p-2.5 bg-background text-primary-accent rounded-card">
            <Building className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
              Destination Warehouse
            </p>
            <p className="text-sm font-bold text-primary truncate mt-0.5">
              {transfer.destination_warehouse_name}
            </p>
          </div>
        </div>

        {/* Creator Info */}
        <div className="bg-white border border-border p-4 rounded-card shadow-minimal flex items-center space-x-3">
          <div className="p-2.5 bg-background text-primary-accent rounded-card">
            <User className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
              Created By
            </p>
            <p className="text-sm font-bold text-primary truncate mt-0.5">
              User #{transfer.created_by}
            </p>
          </div>
        </div>

        {/* Date Info */}
        <div className="bg-white border border-border p-4 rounded-card shadow-minimal flex items-center space-x-3">
          <div className="p-2.5 bg-background text-primary-accent rounded-card">
            <Calendar className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
              Date Placed
            </p>
            <p className="text-sm font-bold text-primary mt-0.5">
              {formatDate(transfer.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Items list */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-primary">Transfer Items</h3>
        <TransferItemsTable items={transfer.items || []} />
      </div>
    </div>
  );
}
