import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { TransferActivityPoint } from "@/types/dashboard";

interface TransferActivityChartProps {
  data: TransferActivityPoint[];
  selectedDays: number;
  onDaysChange: (days: number) => void;
}

export default function TransferActivityChart({
  data,
  selectedDays,
  onDaysChange,
}: TransferActivityChartProps) {
  // Format dates on XAxis to look short and clean, e.g. "Jun 7"
  const formatXAxis = (dateStr: string) => {
    try {
      const dateObj = new Date(dateStr);
      return dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
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
          <h3 className="text-base font-bold text-primary">Transfer Activity</h3>
          <p className="text-xs text-secondary mt-0.5">
            Daily history of inventory transfers requested versus completed.
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
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-secondary">
            No transfer activity data available for the selected range.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            >
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
              <Line
                name="Transfers Created"
                type="monotone"
                dataKey="transfers_created"
                stroke="#2563EB"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line
                name="Transfers Completed"
                type="monotone"
                dataKey="transfers_completed"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
