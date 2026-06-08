import React from "react";

interface LoadingSkeletonProps {
  className?: string;
}

/**
 * Generic pulsing block skeleton.
 */
export function LoadingSkeleton({ className = "h-4 bg-background rounded w-full" }: LoadingSkeletonProps) {
  return <div className={`animate-pulse ${className}`} />;
}

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
}

/**
 * Reusable table skeleton loader showing pulsing grid header and rows.
 */
export function TableSkeleton({ rows = 5, cols = 5 }: TableSkeletonProps) {
  return (
    <div className="bg-white border border-border rounded-card p-6 space-y-4 shadow-minimal animate-pulse">
      {/* Header bar skeleton */}
      <div className="flex justify-between items-center pb-4 border-b border-border">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 bg-background rounded w-20" />
        ))}
      </div>
      
      {/* Rows skeletons */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex justify-between items-center py-3 border-b border-border last:border-0"
        >
          {Array.from({ length: cols }).map((_, colIndex) => {
            // Vary widths for realistic look
            const widths = ["w-1/4", "w-1/6", "w-12", "w-1/12", "w-16"];
            const widthClass = widths[colIndex % widths.length];
            return <div key={colIndex} className={`h-3.5 bg-background rounded ${widthClass}`} />;
          })}
        </div>
      ))}
    </div>
  );
}

interface CardSkeletonProps {
  count?: number;
}

/**
 * Reusable cards grid skeleton loader for KPIs.
 */
export function CardSkeleton({ count = 4 }: CardSkeletonProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-border p-5 rounded-card shadow-minimal flex items-center space-x-4 h-24"
        >
          <div className="p-6 rounded-full bg-background shrink-0 h-12 w-12" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-background rounded w-1/2" />
            <div className="h-5 bg-background rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
