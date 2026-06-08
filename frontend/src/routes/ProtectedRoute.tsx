import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Show a premium full-screen spinner while loading auth state
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 border-4 border-primary-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-secondary animate-pulse">
            Verifying session...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated users to the Login page, preserving the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render children routes (via Outlet) if authenticated
  return <Outlet />;
}
