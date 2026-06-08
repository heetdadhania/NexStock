import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { CategoryCreate } from "@/types/category";

// Form validation schema
const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters long"),
  description: z
    .string()
    .max(255, "Description must be at most 255 characters long")
    .optional()
    .or(z.literal("")),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  initialValues?: Partial<CategoryFormValues>;
  onSubmit: (values: CategoryCreate) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function CategoryForm({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialValues?.name || "",
      description: initialValues?.description || "",
    },
  });

  const handleFormSubmit = async (data: CategoryFormValues) => {
    // Sanitize optional fields before submitting
    const payload: CategoryCreate = {
      name: data.name.trim(),
      description: data.description?.trim() || undefined,
    };
    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-primary mb-1.5" htmlFor="name">
          Category Name
        </label>
        <input
          id="name"
          type="text"
          placeholder="e.g. Electronics, Furniture"
          {...register("name")}
          disabled={isLoading}
          className={`block w-full px-3.5 py-2 bg-background border rounded-card text-sm text-primary placeholder:text-secondary/55 focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all duration-200 ${
            errors.name ? "border-error" : "border-border"
          }`}
        />
        {errors.name && (
          <p className="text-xs text-error mt-1.5 font-medium">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-primary mb-1.5" htmlFor="description">
          Description (Optional)
        </label>
        <textarea
          id="description"
          rows={4}
          placeholder="Enter category description..."
          {...register("description")}
          disabled={isLoading}
          className={`block w-full px-3.5 py-2 bg-background border rounded-card text-sm text-primary placeholder:text-secondary/55 focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all duration-200 resize-none ${
            errors.description ? "border-error" : "border-border"
          }`}
        />
        {errors.description && (
          <p className="text-xs text-error mt-1.5 font-medium">{errors.description.message}</p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-3 pt-3 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-semibold rounded-card border border-border bg-white text-primary hover:bg-background transition-all duration-200 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-semibold rounded-card text-white bg-primary-accent hover:bg-primary-accent/90 transition-all duration-200 disabled:opacity-50 flex items-center justify-center min-w-[70px]"
        >
          {isLoading ? (
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "Save"
          )}
        </button>
      </div>
    </form>
  );
}
