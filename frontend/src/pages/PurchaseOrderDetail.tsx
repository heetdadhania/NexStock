import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, User, Building, Truck, FileText } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { purchaseOrderService } from "@/services/purchaseOrderService";
import { showToast } from "@/components/ui/Toast";
import type { PurchaseOrder } from "@/types/purchaseOrder";

import POStatusBadge from "@/components/purchaseOrders/POStatusBadge";
import POItemsTable from "@/components/purchaseOrders/POItemsTable";
import POActionButtons from "@/components/purchaseOrders/POActionButtons";

export default function PurchaseOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const currentUserRole = user?.role || "Viewer";
  const orderId = id ? parseInt(id, 10) : 0;

  const loadOrderDetail = async () => {
    setIsLoading(true);
    try {
      const data = await purchaseOrderService.getById(orderId);
      setOrder(data);
    } catch (error: any) {
      showToast("error", error.message || "Failed to load purchase order details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      loadOrderDetail();
    }
  }, [orderId]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const updated = await purchaseOrderService.approve(orderId);
      showToast("success", `Purchase Order "${updated.po_number}" approved successfully`);
      setOrder(updated);
    } catch (error: any) {
      showToast("error", error.message || "Approval failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReceive = async () => {
    setActionLoading(true);
    try {
      const updated = await purchaseOrderService.receive(orderId);
      showToast("success", `Purchase Order "${updated.po_number}" received. Stock levels updated.`);
      setOrder(updated);
    } catch (error: any) {
      showToast("error", error.message || "Receiving order failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      const updated = await purchaseOrderService.cancel(orderId);
      showToast("success", `Purchase Order "${updated.po_number}" cancelled successfully`);
      setOrder(updated);
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

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(val);
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
            <div key={i} className="h-24 bg-white border border-border rounded-card animate-pulse shadow-minimal"></div>
          ))}
        </div>

        {/* Items Table skeleton */}
        <div className="bg-white border border-border rounded-card p-6 space-y-4 shadow-minimal">
          <div className="h-6 bg-background rounded w-1/4 animate-pulse mb-4"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between py-3 border-b border-border last:border-0">
              <div className="h-4 bg-background rounded w-1/3 animate-pulse"></div>
              <div className="h-4 bg-background rounded w-1/12 animate-pulse"></div>
              <div className="h-4 bg-background rounded w-1/12 animate-pulse"></div>
              <div className="h-4 bg-background rounded w-1/12 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center p-12 space-y-4 bg-white border border-border rounded-card shadow-minimal">
        <h3 className="text-lg font-bold text-primary">Purchase Order Not Found</h3>
        <p className="text-sm text-secondary">The purchase order you are looking for does not exist or was deleted.</p>
        <button
          onClick={() => navigate("/purchase-orders")}
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
          onClick={() => navigate("/purchase-orders")}
          className="inline-flex items-center text-xs font-semibold text-secondary hover:text-primary transition-colors duration-150"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Purchase Orders
        </button>
      </div>

      {/* Main Header bar */}
      <div className="bg-white border border-border p-6 rounded-card shadow-minimal flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-3">
          <FileText className="h-8 w-8 text-primary-accent" />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-mono font-bold text-primary leading-none">
                {order.po_number}
              </h1>
              <POStatusBadge status={order.status} />
            </div>
            <p className="text-xs text-secondary mt-1">
              Placed on {formatDate(order.order_date)}
            </p>
          </div>
        </div>

        {/* Dynamic transition triggers */}
        <POActionButtons
          status={order.status}
          currentUserRole={currentUserRole}
          onApprove={handleApprove}
          onReceive={handleReceive}
          onCancel={handleCancel}
          isLoading={actionLoading}
        />
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Supplier Info */}
        <div className="bg-white border border-border p-4 rounded-card shadow-minimal flex items-center space-x-3">
          <div className="p-2.5 bg-background text-primary-accent rounded-card">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-secondary">Supplier</p>
            <p className="text-sm font-bold text-primary truncate mt-0.5">{order.supplier_name}</p>
          </div>
        </div>

        {/* Warehouse Info */}
        <div className="bg-white border border-border p-4 rounded-card shadow-minimal flex items-center space-x-3">
          <div className="p-2.5 bg-background text-primary-accent rounded-card">
            <Building className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-secondary">Warehouse</p>
            <p className="text-sm font-bold text-primary truncate mt-0.5">{order.warehouse_name}</p>
          </div>
        </div>

        {/* Dates Info */}
        <div className="bg-white border border-border p-4 rounded-card shadow-minimal flex items-center space-x-3">
          <div className="p-2.5 bg-background text-primary-accent rounded-card">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-secondary">Expected Arrival</p>
            <p className="text-sm font-bold text-primary mt-0.5">
              {order.expected_date ? formatDate(order.expected_date) : <span className="text-secondary/50 font-normal italic">Flexible</span>}
            </p>
          </div>
        </div>

        {/* Creator Info */}
        <div className="bg-white border border-border p-4 rounded-card shadow-minimal flex items-center space-x-3">
          <div className="p-2.5 bg-background text-primary-accent rounded-card">
            <User className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-secondary">Created By</p>
            <p className="text-sm font-bold text-primary mt-0.5">User #{order.created_by}</p>
          </div>
        </div>
      </div>

      {/* Items list */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-primary">Order Items</h3>
        <POItemsTable items={order.items || []} />
        
        {/* Value summary */}
        <div className="flex justify-end pr-6">
          <div className="text-right">
            <span className="text-sm text-secondary font-medium mr-2">Total Order Value:</span>
            <span className="text-xl font-bold text-primary-accent">
              {formatCurrency(order.total_value)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
