import React from "react";
import { Edit2, Trash2, AlertTriangle, FolderOpen } from "lucide-react";
import type { Product } from "@/types/product";

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  currentUserRole?: string;
}

export default function ProductTable({
  products,
  onEdit,
  onDelete,
  currentUserRole = "Viewer",
}: ProductTableProps) {
  const canEdit = currentUserRole === "Admin" || currentUserRole === "Manager";
  const canDelete = currentUserRole === "Admin";

  if (products.length === 0) {
    return (
      <div className="bg-white border border-border p-12 rounded-card shadow-minimal text-center flex flex-col items-center justify-center">
        <div className="p-4 rounded-full bg-background text-secondary mb-4">
          <FolderOpen className="h-10 w-10 text-secondary/60" />
        </div>
        <h3 className="text-lg font-bold text-primary">No Products Found</h3>
        <p className="text-sm text-secondary mt-1 max-w-sm">
          No products match the selected filters or none have been created yet.
        </p>
      </div>
    );
  }

  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <div className="bg-white border border-border rounded-card shadow-minimal overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border text-left">
          <thead className="bg-background">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                SKU
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                Name
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                Category
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary">
                Unit Price
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary text-center">
                Current Stock
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary text-center">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-white">
            {products.map((product) => {
              const isLowStock = product.current_quantity <= product.minimum_quantity;
              return (
                <tr
                  key={product.id}
                  className={`hover:bg-background/40 transition-colors duration-150 ${
                    isLowStock ? "bg-warning/[0.02]" : ""
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-primary max-w-xs truncate">
                    <div>{product.name}</div>
                    {product.description && (
                      <span className="text-xs text-secondary font-normal block truncate">
                        {product.description}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                    {product.category_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-primary font-medium">
                    {formatPrice(product.unit_price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <div className="flex items-center justify-center space-x-1.5">
                      <span
                        className={`font-semibold ${
                          isLowStock ? "text-warning" : "text-primary"
                        }`}
                      >
                        {product.current_quantity}
                      </span>
                      {isLowStock && (
                        <AlertTriangle
                          className="h-4 w-4 text-warning shrink-0"
                          title={`Low Stock! Below minimum safety limit (${product.minimum_quantity})`}
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    {product.is_active ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-success/10 text-success">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary/10 text-secondary">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-2.5">
                    {/* Edit button */}
                    <button
                      onClick={() => onEdit(product)}
                      disabled={!canEdit}
                      title={canEdit ? "Edit Product" : "Insufficient permissions to edit"}
                      className="inline-flex p-1.5 rounded-card text-secondary hover:text-primary hover:bg-background disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      <Edit2 className="h-4.5 w-4.5" />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => onDelete(product)}
                      disabled={!canDelete}
                      title={canDelete ? "Delete Product" : "Insufficient permissions to delete"}
                      className="inline-flex p-1.5 rounded-card text-error hover:bg-error/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
