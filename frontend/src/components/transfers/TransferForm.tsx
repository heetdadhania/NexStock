import React from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2 } from "lucide-react";

import type { Warehouse } from "@/types/warehouse";
import type { Product } from "@/types/product";
import type { TransferCreate } from "@/types/inventoryTransfer";

// Validation schema
const transferItemSchema = z.object({
  product_id: z.coerce.number().min(1, "Product is required"),
  quantity: z.coerce
    .number({ invalid_type_error: "Quantity must be a number" })
    .int("Quantity must be an integer")
    .gt(0, "Quantity must be greater than 0"),
});

const transferSchema = z
  .object({
    source_warehouse_id: z.coerce.number().min(1, "Source warehouse is required"),
    destination_warehouse_id: z.coerce.number().min(1, "Destination warehouse is required"),
    items: z.array(transferItemSchema).min(1, "Transfer must contain at least one item"),
  })
  .refine((data) => data.source_warehouse_id !== data.destination_warehouse_id, {
    message: "Source and destination warehouses must be different",
    path: ["destination_warehouse_id"],
  });

type TransferFormValues = z.infer<typeof transferSchema>;

interface TransferFormProps {
  warehouses: Warehouse[];
  products: Product[];
  onSubmit: (values: TransferCreate) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function TransferForm({
  warehouses,
  products,
  onSubmit,
  onCancel,
  isLoading = false,
}: TransferFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      source_warehouse_id: undefined,
      destination_warehouse_id: undefined,
      items: [{ product_id: undefined as any, quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  // Watch selected source warehouse to filter it from destination options
  const watchedSourceId = useWatch({
    control,
    name: "source_warehouse_id",
  });

  const sourceIdNum = watchedSourceId ? parseInt(watchedSourceId as any, 10) : 0;
  const destinationWarehouses = warehouses.filter((w) => w.id !== sourceIdNum);

  const handleFormSubmit = async (data: TransferFormValues) => {
    const payload: TransferCreate = {
      source_warehouse_id: data.source_warehouse_id,
      destination_warehouse_id: data.destination_warehouse_id,
      items: data.items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
    };

    await onSubmit(payload);
  };

  const inputClass = (hasError: boolean) =>
    `block w-full px-3 py-2 bg-background border rounded-card text-sm text-primary placeholder:text-secondary/55 focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all duration-200 ${
      hasError ? "border-error" : "border-border"
    }`;

  const labelClass = "block text-xs font-semibold text-primary mb-1.5";

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Warehouses configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source Warehouse */}
        <div>
          <label className={labelClass} htmlFor="source_warehouse_id">
            Source Warehouse *
          </label>
          <select
            id="source_warehouse_id"
            disabled={isLoading}
            {...register("source_warehouse_id")}
            className={inputClass(!!errors.source_warehouse_id)}
          >
            <option value="">Select Source Warehouse</option>
            {warehouses
              .filter((w) => w.is_active)
              .map((w) => (
                <option key={w.id} value={w.id}>
                  {w.warehouse_name} ({w.warehouse_code})
                </option>
              ))}
          </select>
          {errors.source_warehouse_id && (
            <p className="text-xs text-error mt-1 font-medium">
              {errors.source_warehouse_id.message}
            </p>
          )}
        </div>

        {/* Destination Warehouse */}
        <div>
          <label className={labelClass} htmlFor="destination_warehouse_id">
            Destination Warehouse *
          </label>
          <select
            id="destination_warehouse_id"
            disabled={isLoading}
            {...register("destination_warehouse_id")}
            className={inputClass(!!errors.destination_warehouse_id)}
          >
            <option value="">Select Destination Warehouse</option>
            {destinationWarehouses
              .filter((w) => w.is_active)
              .map((w) => (
                <option key={w.id} value={w.id}>
                  {w.warehouse_name} ({w.warehouse_code})
                </option>
              ))}
          </select>
          {errors.destination_warehouse_id && (
            <p className="text-xs text-error mt-1 font-medium">
              {errors.destination_warehouse_id.message}
            </p>
          )}
        </div>
      </div>

      {/* Dynamic Item list */}
      <div className="border-t border-border pt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-primary">Transfer Items</h4>
          {errors.items?.message && (
            <p className="text-xs text-error font-medium">{errors.items.message}</p>
          )}
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-3 bg-background/30 p-3 rounded-card border border-border/60"
            >
              {/* Product */}
              <div className="w-full md:flex-1">
                <select
                  disabled={isLoading}
                  {...register(`items.${index}.product_id` as const)}
                  className={inputClass(!!errors.items?.[index]?.product_id)}
                >
                  <option value="">Select Product</option>
                  {products
                    .filter((p) => p.is_active)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                </select>
                {errors.items?.[index]?.product_id && (
                  <p className="text-xs text-error mt-1 font-medium">
                    {errors.items[index]?.product_id?.message}
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div className="w-full md:w-36">
                <input
                  type="number"
                  placeholder="Qty"
                  min="1"
                  disabled={isLoading}
                  {...register(`items.${index}.quantity` as const)}
                  className={inputClass(!!errors.items?.[index]?.quantity)}
                />
                {errors.items?.[index]?.quantity && (
                  <p className="text-xs text-error mt-1 font-medium">
                    {errors.items[index]?.quantity?.message}
                  </p>
                )}
              </div>

              {/* Remove Action */}
              <button
                type="button"
                disabled={isLoading || fields.length === 1}
                onClick={() => remove(index)}
                title="Remove Item"
                className="w-full md:w-auto p-2 text-secondary hover:text-error hover:bg-error/5 border border-border md:border-none rounded-card transition-all duration-200 disabled:opacity-40 disabled:hover:bg-transparent animate-pulse"
              >
                <Trash2 className="h-4.5 w-4.5 mx-auto" />
              </button>
            </div>
          ))}
        </div>

        {/* Append button */}
        <div className="flex justify-between border-t border-border mt-4 pt-4">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => append({ product_id: "" as any, quantity: 1 })}
            className="flex items-center text-sm font-semibold text-primary-accent hover:text-primary-accent/80 transition-all duration-150"
          >
            <Plus className="h-4.5 w-4.5 mr-1.5" />
            Add Item Row
          </button>
        </div>
      </div>

      {/* Form Submission buttons */}
      <div className="flex justify-end space-x-3 border-t border-border pt-5 mt-6">
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
            "Create Transfer"
          )}
        </button>
      </div>
    </form>
  );
}
