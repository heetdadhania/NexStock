import React from "react";
import { Search, Filter } from "lucide-react";
import type { Category } from "@/types/category";

interface ProductFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategoryId: string;
  onCategoryChange: (value: string) => void;
  categories: Category[];
}

export default function ProductFilters({
  searchQuery,
  onSearchChange,
  selectedCategoryId,
  onCategoryChange,
  categories,
}: ProductFiltersProps) {
  return (
    <div className="bg-white border border-border p-4 rounded-card shadow-minimal flex flex-col sm:flex-row gap-4 items-center">
      {/* Search Input */}
      <div className="relative w-full sm:flex-1">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary">
          <Search className="h-4.5 w-4.5" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search products by SKU or Name..."
          className="block w-full pl-10 pr-4 py-2 bg-background border border-border rounded-card text-sm text-primary placeholder:text-secondary/55 focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all duration-200"
        />
      </div>

      {/* Category Dropdown Filter */}
      <div className="relative w-full sm:w-60">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary">
          <Filter className="h-4.5 w-4.5" />
        </div>
        <select
          value={selectedCategoryId}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="block w-full pl-10 pr-4 py-2 bg-background border border-border rounded-card text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all duration-200 appearance-none cursor-pointer"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id.toString()}>
              {category.name}
            </option>
          ))}
        </select>
        {/* Custom Chevron Indicator */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-secondary">
          <svg
            className="fill-current h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
