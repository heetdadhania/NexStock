import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { WarehouseCreate, WarehouseUpdate, Warehouse } from "@/types/warehouse";

// Validation schema
const warehouseSchema = z.object({
  warehouse_code: z
    .string()
    .min(1, "Code is required")
    .max(20, "Code must be at most 20 characters"),
  warehouse_name: z
    .string()
    .min(1, "Name is required")
    .max(200, "Name must be at most 200 characters"),
  address: z.string().optional().or(z.literal("")),
  city: z.string().min(1, "City is required"),
  state: z.string().optional().or(z.literal("")),
  country: z.string().min(1, "Country is required"),
  contact_person: z.string().optional().or(z.literal("")),
  contact_email: z
    .string()
    .email("Invalid email format")
    .optional()
    .or(z.literal("")),
  contact_phone: z.string().optional().or(z.literal("")),
  is_active: z.boolean().optional(),
});

type WarehouseFormValues = z.infer<typeof warehouseSchema>;

interface WarehouseFormProps {
  initialValues?: Warehouse | null;
  onSubmit: (values: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function WarehouseForm({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: WarehouseFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      warehouse_code: initialValues?.warehouse_code || "",
      warehouse_name: initialValues?.warehouse_name || "",
      address: initialValues?.address || "",
      city: initialValues?.city || "",
      state: initialValues?.state || "",
      country: initialValues?.country || "",
      contact_person: initialValues?.contact_person || "",
      contact_email: initialValues?.contact_email || "",
      contact_phone: initialValues?.contact_phone || "",
      is_active: initialValues ? initialValues.is_active : true,
    },
  });

  const handleFormSubmit = async (data: WarehouseFormValues) => {
    // Sanitize optional string fields
    const payload: any = {
      warehouse_code: data.warehouse_code.trim(),
      warehouse_name: data.warehouse_name.trim(),
      address: data.address?.trim() || undefined,
      city: data.city.trim(),
      state: data.state?.trim() || undefined,
      country: data.country.trim(),
      contact_person: data.contact_person?.trim() || undefined,
      contact_email: data.contact_email?.trim() || undefined,
      contact_phone: data.contact_phone?.trim() || undefined,
    };

    if (initialValues) {
      payload.is_active = data.is_active;
    }

    await onSubmit(payload);
  };

  const inputClass = (hasError: boolean) =>
    `block w-full px-3.5 py-2 bg-background border rounded-card text-sm text-primary placeholder:text-secondary/55 focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all duration-200 ${
      hasError ? "border-error" : "border-border"
    }`;

  const labelClass = "block text-xs font-semibold text-primary mb-1.5";

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Code */}
        <div>
          <label className={labelClass} htmlFor="warehouse_code">
            Warehouse Code *
          </label>
          <input
            id="warehouse_code"
            type="text"
            placeholder="e.g. WH-NY-01"
            disabled={isLoading || !!initialValues} // Code is typically immutable on edit
            {...register("warehouse_code")}
            className={inputClass(!!errors.warehouse_code)}
          />
          {errors.warehouse_code && (
            <p className="text-xs text-error mt-1 font-medium">{errors.warehouse_code.message}</p>
          )}
        </div>

        {/* Name */}
        <div>
          <label className={labelClass} htmlFor="warehouse_name">
            Warehouse Name *
          </label>
          <input
            id="warehouse_name"
            type="text"
            placeholder="e.g. Manhattan Central"
            disabled={isLoading}
            {...register("warehouse_name")}
            className={inputClass(!!errors.warehouse_name)}
          />
          {errors.warehouse_name && (
            <p className="text-xs text-error mt-1 font-medium">{errors.warehouse_name.message}</p>
          )}
        </div>
      </div>

      {/* Address */}
      <div>
        <label className={labelClass} htmlFor="address">
          Address (Optional)
        </label>
        <input
          id="address"
          type="text"
          placeholder="e.g. 500 Broadway St"
          disabled={isLoading}
          {...register("address")}
          className={inputClass(!!errors.address)}
        />
        {errors.address && (
          <p className="text-xs text-error mt-1 font-medium">{errors.address.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* City */}
        <div>
          <label className={labelClass} htmlFor="city">
            City *
          </label>
          <input
            id="city"
            type="text"
            placeholder="e.g. New York"
            disabled={isLoading}
            {...register("city")}
            className={inputClass(!!errors.city)}
          />
          {errors.city && (
            <p className="text-xs text-error mt-1 font-medium">{errors.city.message}</p>
          )}
        </div>

        {/* State */}
        <div>
          <label className={labelClass} htmlFor="state">
            State (Optional)
          </label>
          <input
            id="state"
            type="text"
            placeholder="e.g. NY"
            disabled={isLoading}
            {...register("state")}
            className={inputClass(!!errors.state)}
          />
          {errors.state && (
            <p className="text-xs text-error mt-1 font-medium">{errors.state.message}</p>
          )}
        </div>

        {/* Country */}
        <div>
          <label className={labelClass} htmlFor="country">
            Country *
          </label>
          <input
            id="country"
            type="text"
            placeholder="e.g. United States"
            disabled={isLoading}
            {...register("country")}
            className={inputClass(!!errors.country)}
          />
          {errors.country && (
            <p className="text-xs text-error mt-1 font-medium">{errors.country.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Contact Person */}
        <div>
          <label className={labelClass} htmlFor="contact_person">
            Contact Person
          </label>
          <input
            id="contact_person"
            type="text"
            placeholder="e.g. John Doe"
            disabled={isLoading}
            {...register("contact_person")}
            className={inputClass(!!errors.contact_person)}
          />
          {errors.contact_person && (
            <p className="text-xs text-error mt-1 font-medium">{errors.contact_person.message}</p>
          )}
        </div>

        {/* Contact Phone */}
        <div>
          <label className={labelClass} htmlFor="contact_phone">
            Contact Phone
          </label>
          <input
            id="contact_phone"
            type="text"
            placeholder="e.g. +1 555-0199"
            disabled={isLoading}
            {...register("contact_phone")}
            className={inputClass(!!errors.contact_phone)}
          />
          {errors.contact_phone && (
            <p className="text-xs text-error mt-1 font-medium">{errors.contact_phone.message}</p>
          )}
        </div>

        {/* Contact Email */}
        <div>
          <label className={labelClass} htmlFor="contact_email">
            Contact Email
          </label>
          <input
            id="contact_email"
            type="text"
            placeholder="e.g. email@domain.com"
            disabled={isLoading}
            {...register("contact_email")}
            className={inputClass(!!errors.contact_email)}
          />
          {errors.contact_email && (
            <p className="text-xs text-error mt-1 font-medium">{errors.contact_email.message}</p>
          )}
        </div>
      </div>

      {/* Status Toggle (Edit Mode Only) */}
      {initialValues && (
        <div className="flex items-center space-x-2.5 py-2 border-t border-border mt-3">
          <input
            id="is_active"
            type="checkbox"
            disabled={isLoading}
            {...register("is_active")}
            className="h-4.5 w-4.5 rounded border-border text-primary-accent focus:ring-primary-accent/20 accent-primary-accent cursor-pointer"
          />
          <label
            htmlFor="is_active"
            className="text-sm font-semibold text-primary select-none cursor-pointer"
          >
            Active Warehouse
          </label>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-border mt-5">
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
