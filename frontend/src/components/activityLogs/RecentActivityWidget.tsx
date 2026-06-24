import React from "react";
import { Link } from "react-router-dom";
import { History, ArrowRight } from "lucide-react";
import type { ActivityLog } from "@/types/activityLog";

interface RecentActivityWidgetProps {
  logs: ActivityLog[];
}

export default function RecentActivityWidget({ logs }: RecentActivityWidgetProps) {
  // Format relative time ago helper
  const formatTimeAgo = (dateStr: string): string => {
    try {
      const now = new Date();
      const past = new Date(dateStr);
      const diffMs = now.getTime() - past.getTime();
      if (diffMs < 0) return "just now";

      const diffSecs = Math.floor(diffMs / 1000);
      if (diffSecs < 60) return "just now";

      const diffMins = Math.floor(diffSecs / 60);
      if (diffMins < 60) return `${diffMins}m ago`;

      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;

      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return dateStr;
    }
  };

  // Action badge styling helper
  const getActionBadge = (action: string) => {
    const act = action.toLowerCase();
    let badgeClass = "text-secondary bg-secondary/10 border-secondary/15";

    if (["created", "received", "completed"].includes(act)) {
      badgeClass = "text-emerald-700 bg-emerald-50 border-emerald-200";
    } else if (act === "updated") {
      badgeClass = "text-blue-700 bg-blue-50 border-blue-200";
    } else if (act === "approved") {
      badgeClass = "text-purple-700 bg-purple-50 border-purple-200";
    } else if (act === "cancelled") {
      badgeClass = "text-error bg-error/5 border-error/15";
    }

    return (
      <span className={`inline-flex px-2 py-0.5 text-[9px] font-bold rounded-full border uppercase tracking-wider ${badgeClass}`}>
        {action}
      </span>
    );
  };

  return (
    <div className="bg-white border border-border p-6 rounded-card shadow-minimal flex flex-col h-full min-h-[450px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h3 className="text-base font-bold text-primary flex items-center">
            <History className="h-4.5 w-4.5 text-primary-accent mr-2 shrink-0" />
            Recent Activity Logs
          </h3>
          <p className="text-xs text-secondary mt-0.5">
            Audit trail of user operations across the platform.
          </p>
        </div>
        <Link
          to="/activity-logs"
          className="text-xs font-bold text-primary-accent hover:underline flex items-center shrink-0"
        >
          View All
          <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Link>
      </div>

      {/* Structured Logs List */}
      <div className="flex-1 mt-4 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-12">
            <div className="p-3 rounded-full bg-secondary/10 text-secondary mb-2">
              <History className="h-6 w-6 text-secondary/60" />
            </div>
            <p className="text-sm font-semibold text-primary">No Activities Logged</p>
            <p className="text-xs text-secondary mt-1 max-w-[200px]">
              No user actions have been recorded yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-left">
              <thead>
                <tr>
                  <th className="pb-3 text-[10px] font-bold text-secondary uppercase tracking-wider">
                    User
                  </th>
                  <th className="pb-3 text-[10px] font-bold text-secondary uppercase tracking-wider">
                    Action
                  </th>
                  <th className="pb-3 text-[10px] font-bold text-secondary uppercase tracking-wider">
                    Entity
                  </th>
                  <th className="pb-3 text-[10px] font-bold text-secondary uppercase tracking-wider">
                    Description
                  </th>
                  <th className="pb-3 text-[10px] font-bold text-secondary uppercase tracking-wider text-right">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/45">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-background/25">
                    {/* User */}
                    <td className="py-2.5 whitespace-nowrap text-xs text-primary font-semibold pr-2">
                      {log.user_name}
                    </td>

                    {/* Action */}
                    <td className="py-2.5 whitespace-nowrap pr-2">
                      {getActionBadge(log.action)}
                    </td>

                    {/* Entity */}
                    <td className="py-2.5 whitespace-nowrap pr-2">
                      <span className="font-mono text-[10px] bg-background border border-border text-primary px-1.5 py-0.5 rounded">
                        {log.entity_type}
                        {log.entity_id !== null && ` #${log.entity_id}`}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="py-2.5 text-xs text-secondary max-w-[120px] truncate pr-2" title={log.description}>
                      {log.description}
                    </td>

                    {/* Time ago */}
                    <td className="py-2.5 whitespace-nowrap text-right text-[10px] text-secondary font-medium">
                      {formatTimeAgo(log.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
