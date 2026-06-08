import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { TrendPoint } from "@/types/dashboard";

interface InventoryTrendChartProps {
  data: TrendPoint[];
  selectedDays: number;
  onDaysChange: (days: number) => void;
}

export default function InventoryTrendChart({
  data,
  selectedDays,
  onDaysChange,
}: InventoryTrendChartProps) {
  // Format dates on XAxis to look short and clean, e.g. "Jun 7"
  const formatXAxis = (dateStr: string) => {
    try {
      const dateObj = new Date(dateStr);
      return dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC", // Avoid local timezone shift issues
      });
    } catch {
      return dateStr;
    }
  };

  const timeframes = [
    { value: 7, label: "7 Days" },
    { value: 30, label: "30 Days" },
    { value: 90, label: "90 Days" },
  ];

  return (
    <div className="bg-white border border-border p-6 rounded-card shadow-minimal space-y-6">
      {/* Header and timeframe selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-primary">Inventory Trend</h3>
          <p className="text-xs text-secondary mt-0.5">
            Audit history of Stock-In and Stock-Out changes.
          </p>
        </div>

        {/* Time Selector Buttons */}
        <div className="inline-flex rounded-card border border-border p-1 bg-background shrink-0">
          {timeframes.map((tf) => (
            <button
              key={tf.value}
              onClick={() => onDaysChange(tf.value)}
              className={`px-3 py-1.5 text-xs font-bold rounded-card transition-all duration-200 ${
                selectedDays === tf.value
                  ? "bg-white text-primary-accent shadow-sm"
                  : "text-secondary hover:text-primary"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recharts responsive container */}
      <div className="h-72 w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorStockIn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorStockOut" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />

            <XAxis
              dataKey="date"
              tickFormatter={formatXAxis}
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
              labelFormatter={(label) => {
                try {
                  const d = new Date(label as string);
                  return d.toLocaleDateString("en-US", {
                    dateStyle: "medium",
                    timeZone: "UTC",
                  });
                } catch {
                  return label;
                }
              }}
            />

            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "12px", color: "#6B7280" }}
            />

            {/* Stock In Area */}
            <Area
              name="Stock In"
              type="monotone"
              dataKey="stock_in"
              stroke="#10B981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorStockIn)"
            />

            {/* Stock Out Area */}
            <Area
              name="Stock Out"
              type="monotone"
              dataKey="stock_out"
              stroke="#EF4444"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorStockOut)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
