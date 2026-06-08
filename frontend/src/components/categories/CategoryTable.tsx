import React from "react";
import { Edit2, Trash2, FolderOpen } from "lucide-react";
import type { Category } from "@/types/category";

interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  currentUserRole?: string;
}

export default function CategoryTable({
  categories,
  onEdit,
  onDelete,
  currentUserRole = "Viewer",
}: CategoryTableProps) {
  const canEdit = currentUserRole === "Admin" || currentUserRole === "Manager";
  const canDelete = currentUserRole === "Admin";

  if (categories.length === 0) {
    return (
      <div className="bg-white border border-border p-12 rounded-card shadow-minimal text-center flex flex-col items-center justify-center">
        <div className="p-4 rounded-full bg-background text-secondary mb-4">
          <FolderOpen className="h-10 w-10 text-secondary/60" />
        </div>
        <h3 className="text-lg font-bold text-primary">No Categories Found</h3>
        <p className="text-sm text-secondary mt-1 max-w-sm">
          Get started by creating categories to organize your warehouse items.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-card shadow-minimal overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border text-left">
          <thead className="bg-background">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                Name
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                Description
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary text-center">
                Product Count
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-white">
            {categories.map((category) => (
              <tr
                key={category.id}
                className="hover:bg-background/40 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">
                  {category.name}
                </td>
                <td className="px-6 py-4 text-sm text-secondary max-w-xs truncate">
                  {category.description || (
                    <span className="text-secondary/40 italic">No description</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-primary font-medium text-center">
                  {category.product_count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-2.5">
                  {/* Edit button */}
                  <button
                    onClick={() => onEdit(category)}
                    disabled={!canEdit}
                    title={canEdit ? "Edit Category" : "Insufficient permissions to edit"}
                    className="inline-flex p-1.5 rounded-card text-secondary hover:text-primary hover:bg-background disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <Edit2 className="h-4.5 w-4.5" />
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => onDelete(category)}
                    disabled={!canDelete}
                    title={canDelete ? "Delete Category" : "Insufficient permissions to delete"}
                    className="inline-flex p-1.5 rounded-card text-error hover:bg-error/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
