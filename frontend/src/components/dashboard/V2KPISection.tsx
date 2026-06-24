import React from "react";
import { Building, Truck, ClipboardList, ArrowLeftRight } from "lucide-react";
import type { V2Stats } from "@/types/dashboard";
import KPICard from "./KPICard";

interface V2KPISectionProps {
  stats: V2Stats | null;
}

export default function V2KPISection({ stats }: V2KPISectionProps) {
  const warehouses = stats?.total_warehouses ?? 0;
  const suppliers = stats?.total_suppliers ?? 0;
  const openPOs = stats?.open_purchase_orders ?? 0;
  const pendingTransfers = stats?.pending_transfers ?? 0;

  const kpis = [
    {
      title: "Total Warehouses",
      value: warehouses,
      icon: Building,
      iconColor: "text-primary-accent",
      iconBg: "bg-primary-accent/10",
      isWarning: false,
    },
    {
      title: "Total Suppliers",
      value: suppliers,
      icon: Truck,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
      isWarning: false,
    },
    {
      title: "Open Purchase Orders",
      value: openPOs,
      icon: ClipboardList,
      iconColor: openPOs > 0 ? "text-warning" : "text-secondary",
      iconBg: openPOs > 0 ? "bg-warning/10" : "bg-secondary/10",
      isWarning: openPOs > 0,
    },
    {
      title: "Pending Transfers",
      value: pendingTransfers,
      icon: ArrowLeftRight,
      iconColor: pendingTransfers > 0 ? "text-warning" : "text-secondary",
      iconBg: pendingTransfers > 0 ? "bg-warning/10" : "bg-secondary/10",
      isWarning: pendingTransfers > 0,
    },
  ];

  return (
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
  );
}
