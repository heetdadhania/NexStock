import React from "react";
import { X } from "lucide-react";

interface TransferModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function TransferModal({
  isOpen,
  title,
  onClose,
  children,
}: TransferModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-primary/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Card content */}
      <div className="relative bg-white rounded-card border border-border shadow-minimal max-w-4xl w-full overflow-hidden z-10 p-6 animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border mb-5">
          <h3 className="text-lg font-bold text-primary">{title}</h3>
          <button
            onClick={onClose}
            className="text-secondary hover:text-primary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="overflow-y-auto max-h-[75vh] pr-1">{children}</div>
      </div>
    </div>
  );
}
