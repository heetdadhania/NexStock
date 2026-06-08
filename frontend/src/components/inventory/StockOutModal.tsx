import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, ArrowDownLeft } from "lucide-react";
import type { InventoryItem } from "@/types/inventory";
import { inventoryService } from "@/services/inventoryService";
import { showToast } from "@/components/ui/Toast";

// Dynamic schema generator based on available stock
const createStockOutSchema = (maxQty: number) =>
  z.object({
    quantity: z
      .string()
      .min(1, "Quantity is required")
      .refine(
        (val) => !isNaN(parseInt(val, 10)) && parseInt(val, 10) > 0,
        "Quantity must be a positive number greater than 0"
      )
      .refine(
        (val) => !isNaN(parseInt(val, 10)) && parseInt(val, 10) <= maxQty,
        `Quantity cannot exceed current available stock (${maxQty})`
      ),
    remarks: z
      .string()
      .max(255, "Remarks must be at most 255 characters")
      .optional()
      .or(z.literal("")),
  });

type StockOutFormValues = {
  quantity: string;
  remarks: string;
};

interface StockOutModalProps {
  isOpen: boolean;
  product: InventoryItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function StockOutModal({
  isOpen,
  product,
  onClose,
  onSuccess,
}: StockOutModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const currentQuantity = product?.current_quantity || 0;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StockOutFormValues>({
    resolver: zodResolver(createStockOutSchema(currentQuantity)),
    defaultValues: {
      quantity: "",
      remarks: "",
    },
  });

  // Reset form when modal opens with a new product
  useEffect(() => {
    if (isOpen) {
      reset({
        quantity: "",
        remarks: "",
      });
    }
  }, [isOpen, product, reset]);

  if (!isOpen || !product) return null;

  const onSubmitForm = async (data: StockOutFormValues) => {
    setIsLoading(true);
    try {
      await inventoryService.stockOut({
        product_id: product.id,
        quantity: parseInt(data.quantity, 10),
        remarks: data.remarks?.trim() || undefined,
      });
      showToast(
        "success",
        `Successfully withdrew ${data.quantity} units from ${product.product_name}`
      );
      onSuccess();
      onClose();
    } catch (error: any) {
      showToast("error", error.message || "Failed to log stock-out movement");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-primary/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Dialog Card */}
      <div className="relative bg-white rounded-card border border-border shadow-minimal max-w-md w-full overflow-hidden z-10 p-6 animate-slide-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-secondary hover:text-primary transition-colors disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title and Icon */}
        <div className="flex items-center space-x-3 pb-4 border-b border-border mb-5">
          <div className="p-2 rounded-full bg-error/10 text-error">
            <ArrowDownLeft className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-primary">Stock Out (Withdraw Stock)</h3>
        </div>

        {/* Product Meta Card */}
        <div className="bg-background border border-border rounded-card p-4 mb-4">
          <div className="text-xs font-semibold text-secondary uppercase tracking-wider">
            Product Details
          </div>
          <div className="text-sm font-bold text-primary mt-1">
            {product.product_name}
          </div>
          <div className="flex justify-between items-center text-xs text-secondary mt-1.5 font-medium">
            <span>SKU: {product.sku}</span>
            <span className="font-bold text-primary">Available Stock: {product.current_quantity}</span>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          {/* Quantity */}
          <div>
            <label
              className="block text-sm font-semibold text-primary mb-1.5"
              htmlFor="stock-out-qty"
            >
              Quantity to Withdraw
            </label>
            <input
              id="stock-out-qty"
              type="number"
              placeholder={`Max available: ${product.current_quantity}`}
              {...register("quantity")}
              disabled={isLoading || product.current_quantity === 0}
              className={`block w-full px-3.5 py-2 bg-background border rounded-card text-sm text-primary placeholder:text-secondary/55 focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all duration-200 ${
                errors.quantity ? "border-error" : "border-border"
              }`}
            />
            {product.current_quantity === 0 && (
              <p className="text-xs text-error mt-1.5 font-semibold">
                Cannot withdraw stock. Product is currently out of stock.
              </p>
            )}
            {errors.quantity && (
              <p className="text-xs text-error mt-1.5 font-medium">
                {errors.quantity.message}
              </p>
            )}
          </div>

          {/* Remarks */}
          <div>
            <label
              className="block text-sm font-semibold text-primary mb-1.5"
              htmlFor="stock-out-remarks"
            >
              Remarks (Optional)
            </label>
            <textarea
              id="stock-out-remarks"
              rows={3}
              placeholder="e.g. Dispatched to store shelf"
              {...register("remarks")}
              disabled={isLoading || product.current_quantity === 0}
              className={`block w-full px-3.5 py-2 bg-background border rounded-card text-sm text-primary placeholder:text-secondary/55 focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all duration-200 resize-none ${
                errors.remarks ? "border-error" : "border-border"
              }`}
            />
            {errors.remarks && (
              <p className="text-xs text-error mt-1.5 font-medium">
                {errors.remarks.message}
              </p>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end space-x-3 pt-3 border-t border-border mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-semibold rounded-card border border-border bg-white text-primary hover:bg-background transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || product.current_quantity === 0}
              className="px-4 py-2 text-sm font-semibold rounded-card text-white bg-error hover:bg-error/90 transition-all duration-200 disabled:opacity-50 flex items-center justify-center min-w-[100px]"
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Withdraw"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
