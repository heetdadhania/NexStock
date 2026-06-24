import React from "react";
import { Eye, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { PurchaseOrder } from "@/types/purchaseOrder";
import POStatusBadge from "./POStatusBadge";

interface POTableProps {
  orders: PurchaseOrder[];
}

export default function POTable({ orders }: POTableProps) {
  const navigate = useNavigate();

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

  if (orders.length === 0) {
    return (
      <div className="bg-white border border-border p-12 rounded-card shadow-minimal text-center flex flex-col items-center justify-center">
        <div className="p-4 rounded-full bg-background text-secondary mb-4">
          <ClipboardList className="h-10 w-10 text-secondary/60" />
        </div>
        <h3 className="text-lg font-bold text-primary">No Purchase Orders Found</h3>
        <p className="text-sm text-secondary mt-1 max-w-sm">
          No purchase orders found matching your filters. Add a new purchase order to get started.
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
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                PO Number
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                Supplier
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                Warehouse
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                Order Date
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                Items
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                Total Value
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-white">
            {orders.map((order) => (
              <tr
                key={order.id}
                onClick={() => navigate(`/purchase-orders/${order.id}`)}
                className="hover:bg-background/40 cursor-pointer transition-colors duration-150"
              >
                {/* PO Number */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-primary-accent">
                  {order.po_number}
                </td>

                {/* Supplier */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">
                  {order.supplier_name}
                </td>

                {/* Warehouse */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                  {order.warehouse_name}
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap text-sm" onClick={(e) => e.stopPropagation()}>
                  <POStatusBadge status={order.status} />
                </td>

                {/* Order Date */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                  {formatDate(order.order_date)}
                </td>

                {/* Items */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-primary font-semibold">
                  {order.item_count}
                </td>

                {/* Total Value */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">
                  {formatCurrency(order.total_value)}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => navigate(`/purchase-orders/${order.id}`)}
                    title="View Purchase Order"
                    className="inline-flex p-1.5 rounded-card text-secondary hover:text-primary hover:bg-background transition-all duration-200"
                  >
                    <Eye className="h-4.5 w-4.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
