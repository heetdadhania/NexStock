import React, { useEffect, useState } from "react";
import { Package, Tag, Warehouse, AlertTriangle, RefreshCw } from "lucide-react";
import { dashboardService } from "@/services/dashboardService";
import { showToast } from "@/components/ui/Toast";

import type {
  DashboardStats,
  TrendPoint,
  LowStockItem,
  V2Stats,
  WarehouseDistribution,
  POStatusSummary,
  TransferActivityPoint,
} from "@/types/dashboard";
import type { ActivityLog } from "@/types/activityLog";

import KPICard from "@/components/dashboard/KPICard";
import LowStockWidget from "@/components/dashboard/LowStockWidget";
import RecentActivityWidget from "@/components/dashboard/RecentActivityWidget";
import LowStockWarehouseWidget from "@/components/warehouseInventory/LowStockWarehouseWidget";
import { warehouseInventoryService } from "@/services/warehouseInventoryService";
import { activityLogService } from "@/services/activityLogService";
import type { WarehouseInventoryItem } from "@/types/warehouseInventory";

import V2KPISection from "@/components/dashboard/V2KPISection";
import WarehouseDistributionChart from "@/components/dashboard/WarehouseDistributionChart";
import POStatusChart from "@/components/dashboard/POStatusChart";
import TransferActivityChart from "@/components/dashboard/TransferActivityChart";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [lowStockWarehouse, setLowStockWarehouse] = useState<WarehouseInventoryItem[]>([]);

  // V2 Dashboard State
  const [v2Stats, setV2Stats] = useState<V2Stats | null>(null);
  const [warehouseDistribution, setWarehouseDistribution] = useState<WarehouseDistribution[]>([]);
  const [poStatusSummary, setPoStatusSummary] = useState<POStatusSummary[]>([]);
  const [transferActivity, setTransferActivity] = useState<TransferActivityPoint[]>([]);
  const [selectedTransferDays, setSelectedTransferDays] = useState<number>(30);
  const [isTransferLoading, setIsTransferLoading] = useState<boolean>(false);

  const [selectedDays, setSelectedDays] = useState<number>(30);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isChartLoading, setIsChartLoading] = useState<boolean>(false);

  // Fetch all dashboard components
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Parallel data fetching for all V1 and V2 stats and activity logs
      const [
        statsData,
        trendData,
        lowStockData,
        recentData,
        lowStockWarehouseData,
        v2StatsData,
        distributionData,
        poSummaryData,
        transferActivityData,
      ] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getInventoryTrend(selectedDays),
        dashboardService.getLowStock(),
        activityLogService.getRecent(10),
        warehouseInventoryService.getLowStock(),
        dashboardService.getV2Stats(),
        dashboardService.getInventoryDistribution(),
        dashboardService.getPOStatusSummary(),
        dashboardService.getTransferActivity(selectedTransferDays),
      ]);

      setStats(statsData);
      setTrend(trendData);
      setLowStock(lowStockData);
      setRecentActivity(recentData);
      setLowStockWarehouse(lowStockWarehouseData);
      setV2Stats(v2StatsData);
      setWarehouseDistribution(distributionData);
      setPoStatusSummary(poSummaryData);
      setTransferActivity(transferActivityData);
    } catch (error: any) {
      showToast("error", error.message || "Failed to load dashboard metrics");
    } finally {
      setIsLoading(false);
    }
  };

  // Sync trend fetching when days range changes
  const loadTrendData = async (days: number) => {
    setIsChartLoading(true);
    try {
      const trendData = await dashboardService.getInventoryTrend(days);
      setTrend(trendData);
    } catch (error: any) {
      showToast("error", error.message || "Failed to load trend data");
    } finally {
      setIsChartLoading(false);
    }
  };

  // Sync transfer fetching when transfer days range changes
  const loadTransferData = async (days: number) => {
    setIsTransferLoading(true);
    try {
      const activityData = await dashboardService.getTransferActivity(days);
      setTransferActivity(activityData);
    } catch (error: any) {
      showToast("error", error.message || "Failed to load transfer activity data");
    } finally {
      setIsTransferLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleDaysChange = (days: number) => {
    setSelectedDays(days);
    loadTrendData(days);
  };

  const handleTransferDaysChange = (days: number) => {
    setSelectedTransferDays(days);
    loadTransferData(days);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Welcome Header Skeleton */}
        <div className="bg-white border border-border p-6 rounded-card shadow-minimal flex flex-col justify-center h-20">
          <div className="h-5 bg-background rounded w-1/3"></div>
          <div className="h-3 bg-background rounded w-1/4 mt-2"></div>
        </div>

        {/* Row 1: V2 KPI Grid Skeleton */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white border border-border p-6 rounded-card shadow-minimal flex items-center space-x-4 h-24"
            >
              <div className="p-6 rounded-full bg-background shrink-0 h-12 w-12"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-background rounded w-1/2"></div>
                <div className="h-5 bg-background rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Row 2: V1 KPI Grid Skeleton */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white border border-border p-6 rounded-card shadow-minimal flex items-center space-x-4 h-24"
            >
              <div className="p-6 rounded-full bg-background shrink-0 h-12 w-12"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-background rounded w-1/2"></div>
                <div className="h-5 bg-background rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Row 3: Charts Skeleton */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-white border border-border p-6 rounded-card shadow-minimal h-[350px] flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-4 bg-background rounded w-1/3"></div>
              <div className="h-3 bg-background rounded w-1/4"></div>
            </div>
            <div className="h-48 bg-background rounded w-full"></div>
          </div>
          <div className="bg-white border border-border p-6 rounded-card shadow-minimal h-[350px] flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-4 bg-background rounded w-1/3"></div>
              <div className="h-3 bg-background rounded w-1/4"></div>
            </div>
            <div className="h-48 bg-background rounded w-full"></div>
          </div>
        </div>

        {/* Row 4: Transfer Activity Chart Skeleton */}
        <div className="bg-white border border-border p-6 rounded-card shadow-minimal h-80 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <div className="space-y-2 w-1/2">
              <div className="h-4 bg-background rounded w-1/3"></div>
              <div className="h-3 bg-background rounded w-1/4"></div>
            </div>
            <div className="h-8 bg-background rounded w-28"></div>
          </div>
          <div className="h-48 bg-background rounded w-full"></div>
        </div>

        {/* Row 5: Widgets Grid Skeleton */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left: Low Stock Widgets (stacked) */}
          <div className="space-y-6">
            <div className="bg-white border border-border p-6 rounded-card shadow-minimal h-[220px] flex flex-col space-y-4">
              <div className="h-4 bg-background rounded w-1/4 pb-3 border-b border-border"></div>
              {[1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-3 bg-background rounded w-1/3"></div>
                    <div className="h-3 bg-background rounded w-1/12"></div>
                  </div>
                  <div className="h-2 bg-background rounded w-full"></div>
                </div>
              ))}
            </div>
            <div className="bg-white border border-border p-6 rounded-card shadow-minimal h-[220px] flex flex-col space-y-4">
              <div className="h-4 bg-background rounded w-1/4 pb-3 border-b border-border"></div>
              {[1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-3 bg-background rounded w-1/3"></div>
                    <div className="h-3 bg-background rounded w-1/12"></div>
                  </div>
                  <div className="h-2 bg-background rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Recent Activity Widget */}
          <div className="bg-white border border-border p-6 rounded-card shadow-minimal h-[460px] flex flex-col space-y-4">
            <div className="h-4 bg-background rounded w-1/4 pb-3 border-b border-border"></div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between items-center py-1.5 border-b border-background/50">
                <div className="space-y-1 w-1/2">
                  <div className="h-3 bg-background rounded w-2/3"></div>
                  <div className="h-2 bg-background rounded w-1/3"></div>
                </div>
                <div className="h-5 bg-background rounded w-12"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const kpis = [
    {
      title: "Total Products",
      value: stats?.total_products ?? 0,
      icon: Package,
      iconColor: "text-primary-accent",
      iconBg: "bg-primary-accent/10",
      isWarning: false,
    },
    {
      title: "Total Categories",
      value: stats?.total_categories ?? 0,
      icon: Tag,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50",
      isWarning: false,
    },
    {
      title: "Total Inventory Quantity",
      value: stats?.total_inventory_quantity ?? 0,
      icon: Warehouse,
      iconColor: "text-success",
      iconBg: "bg-success/10",
      isWarning: false,
    },
    {
      title: "Low Stock Products",
      value: stats?.low_stock_count ?? 0,
      icon: AlertTriangle,
      iconColor: (stats?.low_stock_count ?? 0) > 0 ? "text-warning" : "text-secondary",
      iconBg: (stats?.low_stock_count ?? 0) > 0 ? "bg-warning/10" : "bg-secondary/10",
      isWarning: (stats?.low_stock_count ?? 0) > 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner Header */}
      <div className="bg-white border border-border p-6 rounded-card shadow-minimal flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-primary">Warehouse Dashboard</h1>
          <p className="text-sm text-secondary mt-1">
            Real-time insights on catalog assets, safety margins, and recent transactions.
          </p>
        </div>

        <button
          onClick={loadDashboardData}
          className="inline-flex items-center self-start md:self-auto px-4 py-2 text-sm font-semibold rounded-card border border-border bg-white text-primary hover:bg-background shadow-minimal transition-all duration-200"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </button>
      </div>

      {/* Row 1: V2 KPI Section */}
      <V2KPISection stats={v2Stats} />

      {/* Row 2: V1 KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <KPICard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            iconColorClass={kpi.iconColor}
            iconBgClass={kpi.iconBg}
            isWarning={kpi.isWarning}
          />
        ))}
      </div>

      {/* Row 3: Inventory Distribution Chart (50%) | PO Status Chart (50%) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <WarehouseDistributionChart data={warehouseDistribution} />
        <POStatusChart data={poStatusSummary} />
      </div>

      {/* Row 4: Transfer Activity Chart (full width) */}
      <div className="relative">
        <TransferActivityChart
          data={transferActivity}
          selectedDays={selectedTransferDays}
          onDaysChange={handleTransferDaysChange}
        />
        {isTransferLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center rounded-card">
            <div className="h-8 w-8 border-2 border-primary-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Row 5: Low Stock Widget (50%) | Recent Activity Widget (50%) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left 50% - Low Stock stack */}
        <div className="flex flex-col gap-6">
          <LowStockWidget items={lowStock} />
          <LowStockWarehouseWidget items={lowStockWarehouse} />
        </div>
        {/* Right 50% - Recent Activity Widget */}
        <RecentActivityWidget logs={recentActivity} />
      </div>
    </div>
  );
}

