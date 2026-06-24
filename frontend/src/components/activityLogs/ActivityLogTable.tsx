import React, { useState } from "react";
import { Activity, ChevronLeft, ChevronRight, Calendar, User } from "lucide-react";
import type { ActivityLog } from "@/types/activityLog";

interface ActivityLogTableProps {
  logs: ActivityLog[];
}

export default function ActivityLogTable({ logs }: ActivityLogTableProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Formatting date helper
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  // Action Badge styling helper
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
      <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full border uppercase tracking-wider ${badgeClass}`}>
        {action}
      </span>
    );
  };

  // Entity Type styling helper
  const formatEntityType = (type: string) => {
    return (
      <span className="font-mono text-xs font-semibold px-1.5 py-0.5 bg-background border border-border text-primary rounded">
        {type}
      </span>
    );
  };

  // Pagination logic
  const totalPages = Math.ceil(logs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = logs.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  if (logs.length === 0) {
    return (
      <div className="bg-white border border-border p-12 rounded-card shadow-minimal text-center flex flex-col items-center justify-center">
        <div className="p-4 rounded-full bg-background text-secondary mb-4">
          <Activity className="h-10 w-10 text-secondary/60" />
        </div>
        <h3 className="text-lg font-bold text-primary">No Activity Logs Found</h3>
        <p className="text-sm text-secondary mt-1 max-w-sm">
          No user activities match the filter criteria or have been recorded in the database yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-card shadow-minimal flex flex-col overflow-hidden">
      {/* Table grid */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border text-left">
          <thead className="bg-background">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                Date & Time
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                User
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                Action
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                Entity Type
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-white">
            {paginatedLogs.map((log) => (
              <tr
                key={log.id}
                className="hover:bg-background/40 transition-colors duration-150"
              >
                {/* Date & Time */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary flex items-center">
                  <Calendar className="h-4 w-4 text-secondary/60 mr-2 shrink-0" />
                  {formatDate(log.created_at)}
                </td>

                {/* User */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-primary font-semibold">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-primary-accent mr-2 shrink-0" />
                    <span>
                      {log.user_name}{" "}
                      <span className="text-xs text-secondary font-medium font-mono">
                        (ID: {log.user_id})
                      </span>
                    </span>
                  </div>
                </td>

                {/* Action */}
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {getActionBadge(log.action)}
                </td>

                {/* Entity Type */}
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {formatEntityType(log.entity_type)}
                </td>

                {/* Description */}
                <td className="px-6 py-4 text-sm text-primary max-w-xs md:max-w-md lg:max-w-xl truncate" title={log.description}>
                  {log.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="px-6 py-4 bg-background border-t border-border flex items-center justify-between">
          <span className="text-xs text-secondary font-medium">
            Showing <span className="font-semibold">{startIndex + 1}</span> to{" "}
            <span className="font-semibold">
              {Math.min(startIndex + itemsPerPage, logs.length)}
            </span>{" "}
            of <span className="font-semibold">{logs.length}</span> logs
          </span>

          <div className="inline-flex space-x-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="p-1.5 rounded-card border border-border bg-white text-secondary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="inline-flex items-center text-xs font-bold text-primary px-3 bg-white border border-border rounded-card">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-card border border-border bg-white text-secondary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
