import React, { useEffect, useState } from "react";
import { Search, Filter, Calendar, RefreshCw, BarChart2 } from "lucide-react";
import { activityLogService } from "@/services/activityLogService";
import { showToast } from "@/components/ui/Toast";
import type { ActivityLog, ActivityLogFilters } from "@/types/activityLog";
import ActivityLogTable from "@/components/activityLogs/ActivityLogTable";

export default function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filter states
  const [entityType, setEntityType] = useState<string>("");
  const [userIdFilter, setUserIdFilter] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [limit, setLimit] = useState<number>(50);

  // Fetch all logs matching filters
  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const filters: ActivityLogFilters = {
        limit,
      };
      if (entityType) filters.entity_type = entityType;
      if (userIdFilter) {
        const parsedId = parseInt(userIdFilter, 10);
        if (!isNaN(parsedId)) {
          filters.user_id = parsedId;
        }
      }
      if (fromDate) filters.from_date = fromDate;
      if (toDate) filters.to_date = toDate;

      const data = await activityLogService.getAll(filters);
      setLogs(data);
    } catch (error: any) {
      showToast("error", error.message || "Failed to load activity logs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [entityType, limit]); // Re-fetch on dropdown selection changes

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const handleResetFilters = () => {
    setEntityType("");
    setUserIdFilter("");
    setFromDate("");
    setToDate("");
    setLimit(50);
    // Fetch logs with reset filters
    setIsLoading(true);
    activityLogService.getAll({ limit: 50 })
      .then((data) => setLogs(data))
      .catch((error: any) => showToast("error", error.message || "Failed to load activity logs"))
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-primary">Activity Logs</h1>
          <p className="text-sm text-secondary mt-1">
            Audit trail of administrative actions, status transitions, and data creation.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={isLoading}
          className="inline-flex items-center self-start sm:self-auto px-3.5 py-2 text-sm font-semibold rounded-card border border-border bg-white text-primary hover:bg-background shadow-minimal transition-all duration-200 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filters Bar */}
      <form
        onSubmit={handleApplyFilters}
        className="bg-white border border-border p-4 rounded-card shadow-minimal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end"
      >
        {/* Entity Type Dropdown */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-secondary uppercase tracking-wider">
            Entity Type
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
              <Filter className="h-4 w-4" />
            </div>
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              className="block w-full pl-9 pr-8 py-2 bg-background border border-border rounded-card text-xs text-primary focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all duration-200 appearance-none cursor-pointer"
            >
              <option value="">All Entities</option>
              <option value="warehouse">Warehouse</option>
              <option value="supplier">Supplier</option>
              <option value="purchase_order">Purchase Order</option>
              <option value="transfer">Inventory Transfer</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-secondary">
              <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        {/* User ID Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-secondary uppercase tracking-wider">
            User ID
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="number"
              value={userIdFilter}
              onChange={(e) => setUserIdFilter(e.target.value)}
              placeholder="e.g. 1"
              min="1"
              className="block w-full pl-9 pr-3 py-2 bg-background border border-border rounded-card text-xs text-primary focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all duration-200"
            />
          </div>
        </div>

        {/* From Date */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-secondary uppercase tracking-wider">
            From Date
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
              <Calendar className="h-4 w-4" />
            </div>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 bg-background border border-border rounded-card text-xs text-primary focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all duration-200"
            />
          </div>
        </div>

        {/* To Date */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-secondary uppercase tracking-wider">
            To Date
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
              <Calendar className="h-4 w-4" />
            </div>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 bg-background border border-border rounded-card text-xs text-primary focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all duration-200"
            />
          </div>
        </div>

        {/* Limit Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-secondary uppercase tracking-wider">
            Limit Results
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
              <BarChart2 className="h-4 w-4" />
            </div>
            <select
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value, 10))}
              className="block w-full pl-9 pr-8 py-2 bg-background border border-border rounded-card text-xs text-primary focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all duration-200 appearance-none cursor-pointer"
            >
              <option value={20}>20 records</option>
              <option value={50}>50 records</option>
              <option value={100}>100 records</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-secondary">
              <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="submit"
            className="w-full py-2 bg-primary-accent hover:bg-primary-accent-hover text-white text-xs font-bold rounded-card shadow-minimal transition-all duration-200 text-center"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={handleResetFilters}
            className="w-full py-2 bg-background border border-border text-secondary hover:text-primary rounded-card text-xs font-bold transition-all duration-200 text-center"
          >
            Clear
          </button>
        </div>
      </form>

      {/* Logs Table Area */}
      {isLoading ? (
        <div className="bg-white border border-border rounded-card p-6 space-y-4 shadow-minimal animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex justify-between items-center py-3 border-b border-border last:border-0"
            >
              <div className="h-4 bg-background rounded w-1/5"></div>
              <div className="h-4 bg-background rounded w-1/4"></div>
              <div className="h-5 bg-background rounded w-16"></div>
              <div className="h-5 bg-background rounded w-20"></div>
              <div className="h-4 bg-background rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <ActivityLogTable logs={logs} />
      )}
    </div>
  );
}
