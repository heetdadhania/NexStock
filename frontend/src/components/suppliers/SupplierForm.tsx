import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { SupplierCreate, SupplierUpdate, Supplier } from "@/types/supplier";

// Validation schema
const supplierSchema = z.object({
  supplier_code: z
    .string()
    .min(1, "Code is required")
    .max(20, "Code must be at most 20 characters"),
  supplier_name: z
    .string()
    .min(1, "Name is required")
    .max(200, "Name must be at most 200 characters"),
  contact_person: z.string().optional().or(z.literal("")),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  rating: z
    .number({ invalid_type_error: "Rating must be a number between 0 and 5" })
    .min(0, "Rating must be at least 0")
    .max(5, "Rating must be at most 5")
    .optional()
    .or(z.literal(NaN))
    .transform((val) => (isNaN(val) || val === undefined ? null : val)),
  is_active: z.boolean().optional(),
});

type SupplierFormValues = z.infer<typeof supplierSchema>;

interface SupplierFormProps {
  initialValues?: Supplier | null;
  onSubmit: (values: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function SupplierForm({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: SupplierFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      supplier_code: initialValues?.supplier_code || "",
      supplier_name: initialValues?.supplier_name || "",
      contact_person: initialValues?.contact_person || "",
      email: initialValues?.email || "",
      phone: initialValues?.phone || "",
      address: initialValues?.address || "",
      rating: initialValues?.rating !== null ? initialValues?.rating : NaN,
      is_active: initialValues ? initialValues.is_active : true,
    },
  });

  const handleFormSubmit = async (data: SupplierFormValues) => {
    // Sanitize values
    const payload: any = {
      supplier_code: data.supplier_code.trim(),
      supplier_name: data.supplier_name.trim(),
      contact_person: data.contact_person?.trim() || undefined,
      email: data.email.trim(),
      phone: data.phone?.trim() || undefined,
      address: data.address?.trim() || undefined,
      rating: data.rating !== undefined ? data.rating : null,
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
          <label className={labelClass} htmlFor="supplier_code">
            Supplier Code *
          </label>
          <input
            id="supplier_code"
            type="text"
            placeholder="e.g. SUP-AMZ-01"
            disabled={isLoading || !!initialValues}
            {...register("supplier_code")}
            className={inputClass(!!errors.supplier_code)}
          />
          {errors.supplier_code && (
            <p className="text-xs text-error mt-1 font-medium">{errors.supplier_code.message}</p>
          )}
        </div>

        {/* Name */}
        <div>
          <label className={labelClass} htmlFor="supplier_name">
            Supplier Name *
          </label>
          <input
            id="supplier_name"
            type="text"
            placeholder="e.g. Amazon Supply"
            disabled={isLoading}
            {...register("supplier_name")}
            className={inputClass(!!errors.supplier_name)}
          />
          {errors.supplier_name && (
            <p className="text-xs text-error mt-1 font-medium">{errors.supplier_name.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email */}
        <div>
          <label className={labelClass} htmlFor="email">
            Email Address *
          </label>
          <input
            id="email"
            type="text"
            placeholder="e.g. supplier@amazon.com"
            disabled={isLoading}
            {...register("email")}
            className={inputClass(!!errors.email)}
          />
          {errors.email && (
            <p className="text-xs text-error mt-1 font-medium">{errors.email.message}</p>
          )}
        </div>

        {/* Contact Person */}
        <div>
          <label className={labelClass} htmlFor="contact_person">
            Contact Person
          </label>
          <input
            id="contact_person"
            type="text"
            placeholder="e.g. Robert Smith"
            disabled={isLoading}
            {...register("contact_person")}
            className={inputClass(!!errors.contact_person)}
          />
          {errors.contact_person && (
            <p className="text-xs text-error mt-1 font-medium">{errors.contact_person.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Phone */}
        <div>
          <label className={labelClass} htmlFor="phone">
            Phone Number
          </label>
          <input
            id="phone"
            type="text"
            placeholder="e.g. +1 (555) 0122"
            disabled={isLoading}
            {...register("phone")}
            className={inputClass(!!errors.phone)}
          />
          {errors.phone && (
            <p className="text-xs text-error mt-1 font-medium">{errors.phone.message}</p>
          )}
        </div>

        {/* Rating */}
        <div>
          <label className={labelClass} htmlFor="rating">
            Rating (0 - 5)
          </label>
          <input
            id="rating"
            type="number"
            step="0.1"
            placeholder="e.g. 4.5"
            disabled={isLoading}
            {...register("rating", { valueAsNumber: true })}
            className={inputClass(!!errors.rating)}
          />
          {errors.rating && (
            <p className="text-xs text-error mt-1 font-medium">{errors.rating.message}</p>
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
          placeholder="e.g. 100 Main St Suite 400"
          disabled={isLoading}
          {...register("address")}
          className={inputClass(!!errors.address)}
        />
        {errors.address && (
          <p className="text-xs text-error mt-1 font-medium">{errors.address.message}</p>
        )}
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
            Active Supplier
          </label>
        </div>
      )}

      {/* Buttons */}
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
