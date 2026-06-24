import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { POStatusSummary } from "@/types/dashboard";

interface POStatusChartProps {
  data: POStatusSummary[];
}

export default function POStatusChart({ data }: POStatusChartProps) {
  // Filter out statuses with 0 counts to keep the chart clean
  const chartData = data.filter((item) => item.count > 0);

  // Status Colors mapping
  const COLORS: Record<string, string> = {
    draft: "#6B7280",
    approved: "#2563EB",
    received: "#10B981",
    cancelled: "#EF4444",
  };

  const getColor = (status: string) => {
    return COLORS[status.toLowerCase()] || "#9CA3AF";
  };

  const formatStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const totalOrders = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-white border border-border p-6 rounded-card shadow-minimal space-y-6 flex flex-col h-[350px]">
      <div>
        <h3 className="text-base font-bold text-primary">Purchase Order Status</h3>
        <p className="text-xs text-secondary mt-0.5">
          Breakdown of purchase orders and status groupings.
        </p>
      </div>

      <div className="flex-1 w-full text-xs relative flex items-center justify-center">
        {chartData.length === 0 ? (
          <div className="text-secondary">No purchase orders available.</div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="status"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getColor(entry.status)}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any, props: any) => {
                    const item = props.payload;
                    return [
                      `${value} orders ($${item.total_value.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })})`,
                      formatStatusLabel(name as string),
                    ];
                  }}
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
                    fontSize: "12px",
                    color: "#111827",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  formatter={formatStatusLabel}
                  wrapperStyle={{ fontSize: "12px", color: "#6B7280" }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Total value center text for donut chart */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-primary">{totalOrders}</span>
              <span className="text-[10px] text-secondary font-medium uppercase tracking-wider">
                Total POs
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
