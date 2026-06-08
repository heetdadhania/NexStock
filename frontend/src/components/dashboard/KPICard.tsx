import React from "react";
import type { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColorClass: string;
  iconBgClass: string;
  isWarning?: boolean;
}

export default function KPICard({
  title,
  value,
  icon: Icon,
  iconColorClass,
  iconBgClass,
  isWarning = false,
}: KPICardProps) {
  return (
    <div
      className={`bg-white border p-6 rounded-card shadow-minimal flex items-center space-x-4 transition-all hover:scale-[1.01] hover:shadow-sm duration-300 ${
        isWarning ? "border-warning/60 bg-warning/[0.01]" : "border-border"
      }`}
    >
      {/* Icon Circle wrapper */}
      <div className={`p-3 rounded-full shrink-0 ${iconBgClass} ${iconColorClass}`}>
        <Icon className="h-6 w-6" />
      </div>

      {/* Info labels */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-secondary truncate">{title}</p>
        <p
          className={`text-2xl font-bold mt-1 tracking-tight truncate ${
            isWarning ? "text-warning" : "text-primary"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
