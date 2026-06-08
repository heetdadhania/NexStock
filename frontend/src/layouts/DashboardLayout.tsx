import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Warehouse,
  Package,
  Tags,
  BarChart3,
  LogOut,
  User,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { user, logout } = useAuth();

  // Fallback details if context user isn't populated
  const currentUser = user || {
    name: "Guest User",
    email: "guest@nexstock.com",
    role: "Viewer",
  };

  const navigationItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Inventory", path: "/inventory", icon: Warehouse },
    { name: "Products", path: "/products", icon: Package },
    { name: "Categories", path: "/categories", icon: Tags },
    { name: "Reports", path: "/reports", icon: BarChart3 },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-border shrink-0">
        {/* Brand Logo */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Warehouse className="h-6 w-6 text-primary-accent mr-3" />
          <span className="text-xl font-bold tracking-tight text-primary">
            NexStock
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigationItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-card transition-all duration-200 ${
                  isActive
                    ? "bg-primary-accent/10 text-primary-accent"
                    : "text-secondary hover:bg-background hover:text-primary"
                }`}
              >
                <Icon className="h-5 w-5 mr-3 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-border bg-sidebar">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-primary-accent/10 flex items-center justify-center text-primary-accent font-semibold">
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-primary truncate">{currentUser.name}</p>
              <p className="text-xs text-secondary truncate">{currentUser.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-error hover:bg-error/5 rounded-card transition-all duration-200"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden h-16 bg-sidebar border-b border-border flex items-center justify-between px-6 z-10 shrink-0">
        <div className="flex items-center">
          <Warehouse className="h-6 w-6 text-primary-accent mr-2" />
          <span className="text-lg font-bold tracking-tight text-primary">
            NexStock
          </span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-primary hover:text-primary-accent"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-primary/20 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

          {/* Drawer content */}
          <aside className="relative flex flex-col w-64 max-w-xs bg-sidebar border-r border-border h-full">
            <div className="h-16 flex items-center px-6 border-b border-border">
              <Warehouse className="h-6 w-6 text-primary-accent mr-3" />
              <span className="text-xl font-bold tracking-tight text-primary">
                NexStock
              </span>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1">
              {navigationItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-card transition-all duration-200 ${
                      isActive
                        ? "bg-primary-accent/10 text-primary-accent"
                        : "text-secondary hover:bg-background hover:text-primary"
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3 shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-border bg-sidebar">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-primary-accent/10 flex items-center justify-center text-primary-accent font-semibold">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-primary truncate">{currentUser.name}</p>
                  <p className="text-xs text-secondary truncate">{currentUser.role}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-error hover:bg-error/5 rounded-card transition-all duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Desktop Header */}
        <header className="hidden md:flex h-16 bg-sidebar border-b border-border items-center justify-between px-8">
          <h2 className="text-lg font-semibold text-primary">
            {navigationItems.find((item) => location.pathname.startsWith(item.path))?.name || "NexStock"}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-primary">{currentUser.name}</p>
              <p className="text-xs text-secondary">{currentUser.email}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary-accent/10 flex items-center justify-center text-primary-accent font-semibold">
              <User className="h-4 w-4" />
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="p-6 md:p-8 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
