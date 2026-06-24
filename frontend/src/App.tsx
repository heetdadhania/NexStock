import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AuthLayout from "@/layouts/AuthLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import ProtectedRoute from "@/routes/ProtectedRoute";

import { AuthProvider } from "@/hooks/useAuth";
import { ToastContainer } from "@/components/ui/Toast";

import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Warehouses from "@/pages/Warehouses";
import WarehouseInventory from "@/pages/WarehouseInventory";
import Suppliers from "@/pages/Suppliers";
import Inventory from "@/pages/Inventory";
import Products from "@/pages/Products";
import Categories from "@/pages/Categories";
import Reports from "@/pages/Reports";
import PurchaseOrders from "@/pages/PurchaseOrders";
import PurchaseOrderDetail from "@/pages/PurchaseOrderDetail";
import Transfers from "@/pages/Transfers";
import TransferDetail from "@/pages/TransferDetail";
import ActivityLogs from "@/pages/ActivityLogs";

export default function App() {
  return (
    <AuthProvider>
      <ToastContainer />
      <BrowserRouter>
        <Routes>
        {/* Public Authentication Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected Dashboard/Admin Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/warehouses" element={<Warehouses />} />
            <Route path="/warehouses/:id/inventory" element={<WarehouseInventory />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/products" element={<Products />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/purchase-orders" element={<PurchaseOrders />} />
            <Route path="/purchase-orders/:id" element={<PurchaseOrderDetail />} />
            <Route path="/transfers" element={<Transfers />} />
            <Route path="/transfers/:id" element={<TransferDetail />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/activity-logs" element={<ActivityLogs />} />
          </Route>
        </Route>



        {/* Fallbacks */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
