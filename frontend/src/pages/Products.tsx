import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import { showToast } from "@/components/ui/Toast";
import type { Product, ProductCreate } from "@/types/product";
import type { Category } from "@/types/category";

import ProductTable from "@/components/products/ProductTable";
import ProductFilters from "@/components/products/ProductFilters";
import ProductModal from "@/components/products/ProductModal";
import ProductForm from "@/components/products/ProductForm";
import DeleteConfirmModal from "@/components/categories/DeleteConfirmModal";

export default function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const currentUserRole = user?.role || "Viewer";
  const canModify = currentUserRole === "Admin" || currentUserRole === "Manager";

  const loadData = async (catId?: number) => {
    setIsLoading(true);
    try {
      // Fetch products and categories in parallel
      const [productsData, categoriesData] = await Promise.all([
        productService.getAll(catId),
        categoryService.getAll(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error: any) {
      showToast("error", error.message || "Failed to load products page data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync category filter fetch
  const handleCategoryChange = (catIdStr: string) => {
    setSelectedCategoryId(catIdStr);
    const catId = catIdStr ? parseInt(catIdStr, 10) : undefined;
    loadData(catId);
  };

  // Client-side search filtering
  useEffect(() => {
    let result = products;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }
    setFilteredProducts(result);
  }, [products, searchQuery]);

  const handleAddClick = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (values: ProductCreate) => {
    setActionLoading(true);
    try {
      if (selectedProduct) {
        // Edit mode
        await productService.update(selectedProduct.id, values);
        showToast("success", `Product "${values.name}" updated successfully`);
      } else {
        // Create mode
        await productService.create(values);
        showToast("success", `Product "${values.name}" registered successfully`);
      }
      setIsModalOpen(false);
      const catId = selectedCategoryId ? parseInt(selectedCategoryId, 10) : undefined;
      loadData(catId);
    } catch (error: any) {
      showToast("error", error.message || "Operation failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;
    setActionLoading(true);
    try {
      await productService.delete(selectedProduct.id);
      showToast("success", `Product "${selectedProduct.name}" soft deleted successfully`);
      setIsDeleteModalOpen(false);
      const catId = selectedCategoryId ? parseInt(selectedCategoryId, 10) : undefined;
      loadData(catId);
    } catch (error: any) {
      showToast("error", error.message || "Failed to delete product");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-primary">Products</h1>
          <p className="text-sm text-secondary mt-1">
            Manage your catalog items, safety limits, and price points.
          </p>
        </div>

        {canModify && (
          <button
            onClick={handleAddClick}
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-primary-accent hover:bg-primary-accent/90 rounded-card shadow-minimal transition-all duration-200"
          >
            <Plus className="h-4.5 w-4.5 mr-2" />
            Add Product
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <ProductFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategoryId={selectedCategoryId}
        onCategoryChange={handleCategoryChange}
        categories={categories}
      />

      {/* Product List Content */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="bg-white border border-border rounded-card p-6 space-y-4 shadow-minimal animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex justify-between items-center py-2.5 border-b border-border last:border-0"
              >
                <div className="h-4 bg-background rounded w-1/4"></div>
                <div className="h-4 bg-background rounded w-1/6"></div>
                <div className="h-4 bg-background rounded w-1/12"></div>
                <div className="h-4 bg-background rounded w-1/12"></div>
                <div className="h-6 bg-background rounded w-1/12"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <ProductTable
          products={filteredProducts}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          currentUserRole={currentUserRole}
        />
      )}

      {/* Create/Edit Modal dialog */}
      <ProductModal
        isOpen={isModalOpen}
        title={selectedProduct ? "Edit Product" : "Add Product"}
        onClose={() => setIsModalOpen(false)}
      >
        <ProductForm
          initialValues={selectedProduct || undefined}
          categories={categories}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
          isLoading={actionLoading}
        />
      </ProductModal>

      {/* Soft Delete confirmation dialog */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        title="Soft Delete Product"
        message={`Are you sure you want to delete "${selectedProduct?.name}"? Its active status will be set to inactive.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteModalOpen(false)}
        isLoading={actionLoading}
      />
    </div>
  );
}
