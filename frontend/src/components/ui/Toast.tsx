import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

// Global subscribers list and trigger function
type Listener = (toasts: ToastMessage[]) => void;
let listeners: Listener[] = [];
let toastsList: ToastMessage[] = [];

export const showToast = (type: ToastType, message: string) => {
  const id = Math.random().toString(36).substring(2, 9);
  const newToast: ToastMessage = { id, type, message };
  toastsList = [...toastsList, newToast];
  
  listeners.forEach((listener) => listener(toastsList));

  // Auto-dismiss after 3 seconds
  setTimeout(() => {
    toastsList = toastsList.filter((t) => t.id !== id);
    listeners.forEach((listener) => listener(toastsList));
  }, 3000);
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleChange = (newToasts: ToastMessage[]) => {
      setToasts(newToasts);
    };

    listeners.push(handleChange);
    setToasts(toastsList);

    return () => {
      listeners = listeners.filter((l) => l !== handleChange);
    };
  }, []);

  const handleDismiss = (id: string) => {
    toastsList = toastsList.filter((t) => t.id !== id);
    setToasts(toastsList);
    listeners.forEach((listener) => listener(toastsList));
  };

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-success" />,
    error: <AlertCircle className="h-5 w-5 text-error" />,
    warning: <AlertTriangle className="h-5 w-5 text-warning" />,
    info: <Info className="h-5 w-5 text-primary-accent" />,
  };

  const borderColors = {
    success: "border-success bg-success/5",
    error: "border-error bg-error/5",
    warning: "border-warning bg-warning/5",
    info: "border-primary-accent bg-primary-accent/5",
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 space-y-3 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start p-4 rounded-card border shadow-minimal transition-all duration-300 animate-slide-in bg-white ${
            borderColors[toast.type]
          }`}
        >
          <div className="shrink-0 mr-3">{icons[toast.type]}</div>
          <div className="flex-1 text-sm font-medium text-primary leading-tight">
            {toast.message}
          </div>
          <button
            onClick={() => handleDismiss(toast.id)}
            className="shrink-0 ml-3 text-secondary hover:text-primary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
