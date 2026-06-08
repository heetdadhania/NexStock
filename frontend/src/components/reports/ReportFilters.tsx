import React from "react";
import { Search, Filter, Calendar } from "lucide-react";
import type { Category } from "@/types/category";

interface ReportFiltersProps {
  activeTab: "inventory" | "movements" | "low-stock";
  categories: Category[];
  // Inventory Filters
  categoryId: string;
  onCategoryChange: (value: string) => void;
  // Movements Filters
  searchQuery: string;
  onSearchChange: (value: string) => void;
  movementType: string;
  onMovementTypeChange: (value: string) => void;
  fromDate: string;
  onFromDateChange: (value: string) => void;
  toDate: string;
  onToDateChange: (value: string) => void;
  onClearFilters: () => void;
}

export default function ReportFilters({
  activeTab,
  categories,
  categoryId,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  movementType,
  onMovementTypeChange,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
  onClearFilters,
}: ReportFiltersProps) {
  if (activeTab === "low-stock") return null;

  if (activeTab === "inventory") {
    return (
      <div className="bg-white border border-border p-4 rounded-card shadow-minimal flex items-center">
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
            <Filter className="h-4 w-4" />
          </div>
          <select
            value={categoryId}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="block w-full pl-9 pr-8 py-2 bg-background border border-border rounded-card text-xs text-primary focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all duration-200 appearance-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id.toString()}>
                {category.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-secondary">
            <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  // Movements Filters
  return (
    <div className="bg-white border border-border p-4 rounded-card shadow-minimal grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
      {/* Product Search */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-secondary uppercase tracking-wider">
          Product Search
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="SKU or Product..."
            className="block w-full pl-9 pr-3 py-2 bg-background border border-border rounded-card text-xs text-primary focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all duration-200"
          />
        </div>
      </div>

      {/* Movement Type */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-secondary uppercase tracking-wider">
          Movement Type
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
            <Filter className="h-4 w-4" />
          </div>
          <select
            value={movementType}
            onChange={(e) => onMovementTypeChange(e.target.value)}
            className="block w-full pl-9 pr-8 py-2 bg-background border border-border rounded-card text-xs text-primary focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all duration-200 appearance-none cursor-pointer"
          >
            <option value="">All Types</option>
            <option value="IN">IN (Receipts)</option>
            <option value="OUT">OUT (Dispatches)</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-secondary">
            <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
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
            onChange={(e) => onFromDateChange(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 bg-background border border-border rounded-card text-xs text-primary focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all duration-200"
          />
        </div>
      </div>

      {/* To Date & Clear */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
        <div className="sm:col-span-3 space-y-1.5">
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
              onChange={(e) => onToDateChange(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 bg-background border border-border rounded-card text-xs text-primary focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all duration-200"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <button
            onClick={onClearFilters}
            className="w-full py-2 bg-background border border-border rounded-card text-xs font-semibold text-secondary hover:text-primary hover:bg-background transition-all duration-200"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
