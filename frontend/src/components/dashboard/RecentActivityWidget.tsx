import React from "react";
import { Link } from "react-router-dom";
import { History, ArrowRight, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import type { RecentActivity } from "@/types/dashboard";

interface RecentActivityWidgetProps {
  activities: RecentActivity[];
}

export default function RecentActivityWidget({ activities }: RecentActivityWidgetProps) {
  // Slice to top 5 actions to keep layout balanced
  const displayedActivities = activities.slice(0, 5);

  // Format activity timestamp helper
  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white border border-border p-6 rounded-card shadow-minimal flex flex-col h-full min-h-[350px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h3 className="text-base font-bold text-primary flex items-center">
            <History className="h-4.5 w-4.5 text-primary-accent mr-2 shrink-0" />
            Recent Stock Activity
          </h3>
          <p className="text-xs text-secondary mt-0.5">
            Latest logged warehouse inventory adjustments.
          </p>
        </div>
        <Link
          to="/inventory"
          className="text-xs font-bold text-primary-accent hover:underline flex items-center shrink-0"
        >
          View All
          <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Link>
      </div>

      {/* List */}
      <div className="flex-1 mt-4 space-y-3.5">
        {activities.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-8">
            <div className="p-3 rounded-full bg-secondary/10 text-secondary mb-2">
              <History className="h-6 w-6 text-secondary/60" />
            </div>
            <p className="text-sm font-semibold text-primary">No Activity Logged</p>
            <p className="text-xs text-secondary mt-1 max-w-[200px]">
              No stock movements have been logged in the system yet.
            </p>
          </div>
        ) : (
          displayedActivities.map((act, index) => {
            const isIn = act.type === "IN";
            return (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-border/45 last:border-0"
              >
                {/* Product Name & Date */}
                <div className="truncate pr-4">
                  <span className="text-sm font-semibold text-primary block truncate">
                    {act.product_name}
                  </span>
                  <span className="text-[10px] text-secondary font-medium block mt-0.5">
                    {formatTime(act.date)} • {act.created_by_name}
                  </span>
                </div>

                {/* Badge & Qty */}
                <div className="flex items-center space-x-2.5 shrink-0">
                  <span className={`font-bold text-sm ${isIn ? "text-success" : "text-error"}`}>
                    {isIn ? "+" : "-"}
                    {act.quantity}
                  </span>
                  {isIn ? (
                    <span className="inline-flex p-1 rounded-full bg-success/10 text-success border border-success/15">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  ) : (
                    <span className="inline-flex p-1 rounded-full bg-error/10 text-error border border-error/15">
                      <ArrowDownLeft className="h-3.5 w-3.5" />
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
