import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './components/common/Toast';

// Layouts
import { DashboardLayout } from './components/layout/DashboardLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { FeaturesPage } from './pages/public/FeaturesPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Authenticated Pages
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ProductsPage } from './pages/inventory/ProductsPage';
import { WarehousesPage } from './pages/inventory/WarehousesPage';
import { StockTransactionsPage } from './pages/inventory/StockTransactionsPage';
import { SuppliersPage } from './pages/procurement/SuppliersPage';
import { PurchaseOrdersPage } from './pages/procurement/PurchaseOrdersPage';
import { CustomersPage } from './pages/sales/CustomersPage';
import { SalesOrdersPage } from './pages/sales/SalesOrdersPage';
import { InvoicesPage } from './pages/sales/InvoicesPage';
import { InvoiceDetailPage } from './pages/sales/InvoiceDetailPage';
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { UsersPage } from './pages/users/UsersPage';
import { AuditLogPage } from './pages/audit/AuditLogPage';
import { SettingsPage } from './pages/settings/SettingsPage';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <ToastProvider>
            <Routes>
              {/* Public Website */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Authenticated Application */}
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                
                {/* Inventory Module */}
                <Route path="/inventory/products" element={<ProductsPage />} />
                <Route path="/inventory/warehouses" element={<WarehousesPage />} />
                <Route path="/inventory/transactions" element={<StockTransactionsPage />} />

                {/* Procurement Module */}
                <Route path="/procurement/suppliers" element={<SuppliersPage />} />
                <Route path="/procurement/orders" element={<PurchaseOrdersPage />} />

                {/* Sales Module */}
                <Route path="/sales/customers" element={<CustomersPage />} />
                <Route path="/sales/orders" element={<SalesOrdersPage />} />
                <Route path="/sales/invoices" element={<InvoicesPage />} />
                <Route path="/sales/invoices/:id" element={<InvoiceDetailPage />} />

                {/* Intelligence */}
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/reports" element={<ReportsPage />} />

                {/* System */}
                <Route path="/users" element={<UsersPage />} />
                <Route path="/audit-logs" element={<AuditLogPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ToastProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
