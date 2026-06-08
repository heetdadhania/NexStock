import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Category } from "@/types/category";
import type { ProductCreate } from "@/types/product";

// Validation schema
const productSchema = z
  .object({
    sku: z
      .string()
      .min(3, "SKU must be at least 3 characters")
      .max(50, "SKU must be at most 50 characters")
      .regex(/^[A-Za-z0-9-_]+$/, "SKU can only contain letters, numbers, dashes, and underscores"),
    name: z
      .string()
      .min(1, "Product Name is required")
      .max(100, "Name must be at most 100 characters"),
    description: z
      .string()
      .max(255, "Description must be at most 255 characters")
      .optional()
      .or(z.literal("")),
    category_id: z.string().min(1, "Category is required"),
    unit_price: z
      .string()
      .min(1, "Price is required")
      .refine(
        (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
        "Price must be a positive number"
      ),
    minimum_quantity: z
      .string()
      .min(1, "Minimum quantity is required")
      .refine(
        (val) => !isNaN(parseInt(val, 10)) && parseInt(val, 10) >= 0,
        "Minimum quantity must be 0 or more"
      ),
    maximum_quantity: z
      .string()
      .min(1, "Maximum quantity is required")
      .refine(
        (val) => !isNaN(parseInt(val, 10)) && parseInt(val, 10) >= 0,
        "Maximum quantity must be 0 or more"
      ),
  })
  .refine(
    (data) => {
      const min = parseInt(data.minimum_quantity, 10);
      const max = parseInt(data.maximum_quantity, 10);
      return max >= min;
    },
    {
      message: "Maximum quantity must be greater than or equal to minimum quantity",
      path: ["maximum_quantity"],
    }
  );

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialValues?: Partial<Product>;
  categories: Category[];
  onSubmit: (values: ProductCreate) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ProductForm({
  initialValues,
  categories,
  onSubmit,
  onCancel,
  isLoading = false,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: initialValues?.sku || "",
      name: initialValues?.name || "",
      description: initialValues?.description || "",
      category_id: initialValues?.category_id?.toString() || "",
      unit_price: initialValues?.unit_price?.toString() || "",
      minimum_quantity: initialValues?.minimum_quantity?.toString() || "0",
      maximum_quantity: initialValues?.maximum_quantity?.toString() || "0",
    },
  });

  const handleFormSubmit = async (data: ProductFormValues) => {
    const payload: ProductCreate = {
      sku: data.sku.trim().toUpperCase(),
      name: data.name.trim(),
      description: data.description?.trim() || undefined,
      category_id: parseInt(data.category_id, 10),
      unit_price: parseFloat(data.unit_price),
      minimum_quantity: parseInt(data.minimum_quantity, 10),
      maximum_quantity: parseInt(data.maximum_quantity, 10),
    };
    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SKU Field */}
        <div>
          <label className="block text-sm font-medium text-primary mb-1.5" htmlFor="sku">
            SKU
          </label>
          <input
            id="sku"
            type="text"
            placeholder="e.g. ELEC-PHN-12"
            {...register("sku")}
            disabled={isLoading || !!initialValues}
            className={`block w-full px-3.5 py-2 bg-background border rounded-card text-sm text-primary placeholder:text-secondary/55 uppercase focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all duration-200 ${
              errors.sku ? "border-error" : "border-border"
            }`}
          />
          {errors.sku && (
            <p className="text-xs text-error mt-1.5 font-medium">{errors.sku.message}</p>
          )}
        </div>

        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-primary mb-1.5" htmlFor="name">
            Product Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="e.g. iPhone 15 Pro"
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

        {/* Category Selector */}
        <div>
          <label className="block text-sm font-medium text-primary mb-1.5" htmlFor="category_id">
            Category
          </label>
          <select
            id="category_id"
            {...register("category_id")}
            disabled={isLoading}
            className={`block w-full px-3.5 py-2 bg-background border rounded-card text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all duration-200 cursor-pointer ${
              errors.category_id ? "border-error" : "border-border"
            }`}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category_id && (
            <p className="text-xs text-error mt-1.5 font-medium">{errors.category_id.message}</p>
          )}
        </div>

        {/* Unit Price */}
        <div>
          <label className="block text-sm font-medium text-primary mb-1.5" htmlFor="unit_price">
            Unit Price ($)
          </label>
          <input
            id="unit_price"
            type="text"
            placeholder="e.g. 999.99"
            {...register("unit_price")}
            disabled={isLoading}
            className={`block w-full px-3.5 py-2 bg-background border rounded-card text-sm text-primary placeholder:text-secondary/55 focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all duration-200 ${
              errors.unit_price ? "border-error" : "border-border"
            }`}
          />
          {errors.unit_price && (
            <p className="text-xs text-error mt-1.5 font-medium">{errors.unit_price.message}</p>
          )}
        </div>

        {/* Minimum Quantity (Safety stock threshold) */}
        <div>
          <label className="block text-sm font-medium text-primary mb-1.5" htmlFor="minimum_quantity">
            Minimum Quantity (Low Stock Limit)
          </label>
          <input
            id="minimum_quantity"
            type="number"
            placeholder="e.g. 5"
            {...register("minimum_quantity")}
            disabled={isLoading}
            className={`block w-full px-3.5 py-2 bg-background border rounded-card text-sm text-primary placeholder:text-secondary/55 focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all duration-200 ${
              errors.minimum_quantity ? "border-error" : "border-border"
            }`}
          />
          {errors.minimum_quantity && (
            <p className="text-xs text-error mt-1.5 font-medium">{errors.minimum_quantity.message}</p>
          )}
        </div>

        {/* Maximum Quantity */}
        <div>
          <label className="block text-sm font-medium text-primary mb-1.5" htmlFor="maximum_quantity">
            Maximum Quantity (Capacity Limit)
          </label>
          <input
            id="maximum_quantity"
            type="number"
            placeholder="e.g. 500"
            {...register("maximum_quantity")}
            disabled={isLoading}
            className={`block w-full px-3.5 py-2 bg-background border rounded-card text-sm text-primary placeholder:text-secondary/55 focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all duration-200 ${
              errors.maximum_quantity ? "border-error" : "border-border"
            }`}
          />
          {errors.maximum_quantity && (
            <p className="text-xs text-error mt-1.5 font-medium">{errors.maximum_quantity.message}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-primary mb-1.5" htmlFor="description">
          Description (Optional)
        </label>
        <textarea
          id="description"
          rows={3}
          placeholder="Enter product description..."
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

      {/* Action Footer */}
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
