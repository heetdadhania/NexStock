import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isLoading = false,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-primary/20 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      ></div>

      {/* Modal Dialog Card */}
      <div className="relative bg-white rounded-card border border-border shadow-minimal max-w-md w-full overflow-hidden z-10 p-6 animate-slide-in">
        {/* Close Button */}
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="absolute top-4 right-4 text-secondary hover:text-primary transition-colors disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Warning Icon and Title */}
        <div className="flex items-start space-x-4">
          <div className="shrink-0 p-3 rounded-full bg-error/10 text-error">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-primary">{title}</h3>
            <p className="text-sm text-secondary mt-2 leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-semibold rounded-card border border-border bg-white text-primary hover:bg-background transition-all duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-semibold rounded-card text-white bg-error hover:bg-error/90 transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
