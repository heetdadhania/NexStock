import React from "react";
import { Download } from "lucide-react";

interface ExportButtonProps {
  onExport: () => Promise<void>;
  isLoading?: boolean;
}

export default function ExportButton({ onExport, isLoading = false }: ExportButtonProps) {
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoading) return;
    await onExport();
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-card border border-border bg-white text-primary hover:bg-background shadow-minimal transition-all duration-200 disabled:opacity-50 shrink-0"
    >
      {isLoading ? (
        <div className="h-4 w-4 border-2 border-primary-accent border-t-transparent rounded-full animate-spin mr-2"></div>
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      {isLoading ? "Exporting..." : "Export CSV"}
    </button>
  );
}
