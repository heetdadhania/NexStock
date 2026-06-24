import React from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2 } from "lucide-react";

import type { Supplier } from "@/types/supplier";
import type { Warehouse } from "@/types/warehouse";
import type { Product } from "@/types/product";
import type { PurchaseOrderCreate } from "@/types/purchaseOrder";

// Validation schema
const purchaseOrderItemSchema = z.object({
  product_id: z.coerce.number().min(1, "Product is required"),
  quantity: z.coerce
    .number({ invalid_type_error: "Quantity must be a number" })
    .int("Quantity must be an integer")
    .gt(0, "Quantity must be greater than 0"),
  unit_price: z.coerce
    .number({ invalid_type_error: "Unit price must be a number" })
    .gt(0, "Unit price must be greater than 0"),
});

const purchaseOrderSchema = z.object({
  supplier_id: z.coerce.number().min(1, "Supplier is required"),
  warehouse_id: z.coerce.number().min(1, "Warehouse is required"),
  expected_date: z
    .string()
    .nullable()
    .or(z.literal(""))
    .transform((val) => (val === "" ? null : val)),
  items: z
    .array(purchaseOrderItemSchema)
    .min(1, "Purchase order must contain at least one item"),
});

type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>;

interface POFormProps {
  suppliers: Supplier[];
  warehouses: Warehouse[];
  products: Product[];
  onSubmit: (values: PurchaseOrderCreate) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function POForm({
  suppliers,
  warehouses,
  products,
  onSubmit,
  onCancel,
  isLoading = false,
}: POFormProps) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      supplier_id: undefined,
      warehouse_id: undefined,
      expected_date: "",
      items: [{ product_id: undefined as any, quantity: 1, unit_price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = useWatch({
    control,
    name: "items",
  });

  const handleProductChange = (index: number, productIdStr: string) => {
    const productId = parseInt(productIdStr, 10);
    const selectedProduct = products.find((p) => p.id === productId);
    if (selectedProduct) {
      setValue(`items.${index}.unit_price`, selectedProduct.unit_price);
    }
  };

  const calculateRowTotal = (quantity: any, unitPrice: any) => {
    const q = parseFloat(quantity) || 0;
    const p = parseFloat(unitPrice) || 0;
    return q * p;
  };

  const calculateOverallTotal = () => {
    if (!watchedItems) return 0;
    return watchedItems.reduce((acc, item) => {
      return acc + calculateRowTotal(item?.quantity, item?.unit_price);
    }, 0);
  };

  const handleFormSubmit = async (data: PurchaseOrderFormValues) => {
    // Generate ISO string format for backend order_date
    const payload: PurchaseOrderCreate = {
      supplier_id: data.supplier_id,
      warehouse_id: data.warehouse_id,
      order_date: new Date().toISOString(),
      expected_date: data.expected_date ? new Date(data.expected_date).toISOString() : null,
      items: data.items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
    };

    await onSubmit(payload);
  };

  const inputClass = (hasError: boolean) =>
    `block w-full px-3 py-2 bg-background border rounded-card text-sm text-primary placeholder:text-secondary/55 focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all duration-200 ${
      hasError ? "border-error" : "border-border"
    }`;

  const labelClass = "block text-xs font-semibold text-primary mb-1.5";

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(val);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Primary Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Supplier */}
        <div>
          <label className={labelClass} htmlFor="supplier_id">
            Supplier *
          </label>
          <select
            id="supplier_id"
            disabled={isLoading}
            {...register("supplier_id")}
            className={inputClass(!!errors.supplier_id)}
          >
            <option value="">Select Supplier</option>
            {suppliers
              .filter((s) => s.is_active)
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.supplier_name} ({s.supplier_code})
                </option>
              ))}
          </select>
          {errors.supplier_id && (
            <p className="text-xs text-error mt-1 font-medium">{errors.supplier_id.message}</p>
          )}
        </div>

        {/* Warehouse */}
        <div>
          <label className={labelClass} htmlFor="warehouse_id">
            Warehouse *
          </label>
          <select
            id="warehouse_id"
            disabled={isLoading}
            {...register("warehouse_id")}
            className={inputClass(!!errors.warehouse_id)}
          >
            <option value="">Select Warehouse</option>
            {warehouses
              .filter((w) => w.is_active)
              .map((w) => (
                <option key={w.id} value={w.id}>
                  {w.warehouse_name} ({w.warehouse_code})
                </option>
              ))}
          </select>
          {errors.warehouse_id && (
            <p className="text-xs text-error mt-1 font-medium">{errors.warehouse_id.message}</p>
          )}
        </div>

        {/* Expected Date */}
        <div>
          <label className={labelClass} htmlFor="expected_date">
            Expected Date
          </label>
          <input
            id="expected_date"
            type="date"
            disabled={isLoading}
            {...register("expected_date")}
            className={inputClass(!!errors.expected_date)}
          />
          {errors.expected_date && (
            <p className="text-xs text-error mt-1 font-medium">{errors.expected_date.message}</p>
          )}
        </div>
      </div>

      {/* Items Section */}
      <div className="border-t border-border pt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-primary">Order Items</h4>
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
                  onChange={(e) => {
                    register(`items.${index}.product_id`).onChange(e);
                    handleProductChange(index, e.target.value);
                  }}
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
              <div className="w-full md:w-28">
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

              {/* Unit Price */}
              <div className="w-full md:w-36">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-secondary/60 text-sm select-none">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    min="0.01"
                    disabled={isLoading}
                    {...register(`items.${index}.unit_price` as const)}
                    className={`${inputClass(!!errors.items?.[index]?.unit_price)} pl-7`}
                  />
                </div>
                {errors.items?.[index]?.unit_price && (
                  <p className="text-xs text-error mt-1 font-medium">
                    {errors.items[index]?.unit_price?.message}
                  </p>
                )}
              </div>

              {/* Total Row price display */}
              <div className="w-full md:w-28 text-right pr-2 text-sm font-semibold text-primary pt-1 md:pt-0">
                {formatCurrency(
                  calculateRowTotal(
                    watchedItems?.[index]?.quantity,
                    watchedItems?.[index]?.unit_price
                  )
                )}
              </div>

              {/* Remove Action */}
              <button
                type="button"
                disabled={isLoading || fields.length === 1}
                onClick={() => remove(index)}
                title="Remove Item"
                className="w-full md:w-auto p-2 text-secondary hover:text-error hover:bg-error/5 border border-border md:border-none rounded-card transition-all duration-200 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <Trash2 className="h-4.5 w-4.5 mx-auto" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Row and Total Summary */}
        <div className="flex flex-col md:flex-row items-center justify-between border-t border-border mt-4 pt-4 space-y-3 md:space-y-0">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => append({ product_id: "" as any, quantity: 1, unit_price: 0 })}
            className="flex items-center text-sm font-semibold text-primary-accent hover:text-primary-accent/80 transition-all duration-150"
          >
            <Plus className="h-4.5 w-4.5 mr-1.5" />
            Add Item Row
          </button>

          <div className="text-right">
            <span className="text-sm text-secondary font-medium mr-2">Overall Total:</span>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(calculateOverallTotal())}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
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
            "Create PO"
          )}
        </button>
      </div>
    </form>
  );
}
