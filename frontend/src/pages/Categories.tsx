import React, { useEffect, useState } from "react";
import { Plus, Folder } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { categoryService } from "@/services/categoryService";
import { showToast } from "@/components/ui/Toast";
import type { Category, CategoryCreate } from "@/types/category";

import CategoryTable from "@/components/categories/CategoryTable";
import CategoryModal from "@/components/categories/CategoryModal";
import CategoryForm from "@/components/categories/CategoryForm";
import DeleteConfirmModal from "@/components/categories/DeleteConfirmModal";

export default function Categories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const userRole = user?.role || "Viewer";
  const canModify = userRole === "Admin" || userRole === "Manager";

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error: any) {
      showToast("error", error.message || "Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddClick = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (category: Category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (values: CategoryCreate) => {
    setActionLoading(true);
    try {
      if (selectedCategory) {
        // Edit mode
        await categoryService.update(selectedCategory.id, values);
        showToast("success", `Category "${values.name}" updated successfully`);
      } else {
        // Create mode
        await categoryService.create(values);
        showToast("success", `Category "${values.name}" created successfully`);
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (error: any) {
      showToast("error", error.message || "Operation failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCategory) return;
    setActionLoading(true);
    try {
      await categoryService.delete(selectedCategory.id);
      showToast("success", `Category "${selectedCategory.name}" deleted successfully`);
      setIsDeleteModalOpen(false);
      loadCategories();
    } catch (error: any) {
      showToast("error", error.message || "Failed to delete category");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-primary">Categories</h1>
          <p className="text-sm text-secondary mt-1">
            Group your warehouse products into logical departments.
          </p>
        </div>
        
        {canModify && (
          <button
            onClick={handleAddClick}
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-primary-accent hover:bg-primary-accent/90 rounded-card shadow-minimal transition-all duration-200"
          >
            <Plus className="h-4.5 w-4.5 mr-2" />
            Add Category
          </button>
        )}
      </div>

      {/* Main Content & Loader skeletons */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-10 bg-white border border-border rounded-card animate-pulse"></div>
          <div className="bg-white border border-border rounded-card p-6 space-y-4 shadow-minimal">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                <div className="space-y-2 w-1/3">
                  <div className="h-4 bg-background rounded w-3/4 animate-pulse"></div>
                  <div className="h-3 bg-background rounded w-1/2 animate-pulse"></div>
                </div>
                <div className="h-4 bg-background rounded w-1/12 animate-pulse"></div>
                <div className="h-6 bg-background rounded w-1/12 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <CategoryTable
          categories={categories}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          currentUserRole={userRole}
        />
      )}

      {/* Create/Edit Modal wrapper */}
      <CategoryModal
        isOpen={isModalOpen}
        title={selectedCategory ? "Edit Category" : "Add Category"}
        onClose={() => setIsModalOpen(false)}
      >
        <CategoryForm
          initialValues={selectedCategory || undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
          isLoading={actionLoading}
        />
      </CategoryModal>

      {/* Delete confirmation modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Category"
        message={`Are you sure you want to delete "${selectedCategory?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteModalOpen(false)}
        isLoading={actionLoading}
      />
    </div>
  );
}
