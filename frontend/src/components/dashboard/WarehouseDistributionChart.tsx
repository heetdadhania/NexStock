import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { WarehouseDistribution } from "@/types/dashboard";

interface WarehouseDistributionChartProps {
  data: WarehouseDistribution[];
}

export default function WarehouseDistributionChart({
  data,
}: WarehouseDistributionChartProps) {
  return (
    <div className="bg-white border border-border p-6 rounded-card shadow-minimal space-y-6 flex flex-col h-[350px]">
      <div>
        <h3 className="text-base font-bold text-primary">Warehouse Inventory Distribution</h3>
        <p className="text-xs text-secondary mt-0.5">
          Comparison of total product quantities across warehouses.
        </p>
      </div>

      <div className="flex-1 w-full text-xs">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-secondary">
            No warehouse inventory data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis
                dataKey="warehouse_name"
                tickLine={false}
                axisLine={false}
                stroke="#9CA3AF"
                dy={10}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                stroke="#9CA3AF"
                allowDecimals={false}
              />
              <Tooltip
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
                verticalAlign="top"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "12px", color: "#6B7280" }}
              />
              <Bar
                name="Total Quantity"
                dataKey="total_quantity"
                fill="#2563EB"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
