import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export const ROLE_PERMISSIONS = {
  'Admin': {
    canViewDashboard: true,
    canManageProducts: true,
    canManageWarehouses: true,
    canTransferStock: true,
    canManageSuppliers: true,
    canManagePO: true,
    canApprovePO: true,
    canReceiveGoods: true,
    canManageCustomers: true,
    canManageSalesOrders: true,
    canManageInvoices: true,
    canRecordPayments: true,
    canViewAnalytics: true,
    canExportReports: true,
    canManageUsers: true,
    canViewAuditLogs: true,
    canManageSettings: true
  },
  'Inventory Manager': {
    canViewDashboard: true,
    canManageProducts: true,
    canManageWarehouses: true,
    canTransferStock: true,
    canReceiveGoods: true,
    canViewAnalytics: true,
    canExportReports: true,
    canManageSettings: true
  },
  'Purchase Manager': {
    canViewDashboard: true,
    canManageSuppliers: true,
    canManagePO: true,
    canReceiveGoods: true,
    canExportReports: true,
    canManageSettings: true
  },
  'Sales Manager': {
    canViewDashboard: true,
    canManageCustomers: true,
    canManageSalesOrders: true,
    canManageInvoices: true,
    canRecordPayments: true,
    canExportReports: true,
    canManageSettings: true
  }
};

export const DEMO_CREDENTIALS = [
  { role: 'Admin', email: 'admin@supplychainx.com', password: 'admin123', name: 'Rahul Sharma', desc: 'Full System Access & Approvals' },
  { role: 'Inventory Manager', email: 'amit@supplychainx.com', password: 'manager123', name: 'Amit Verma', desc: 'Multi-Warehouse & Stock Transfers' },
  { role: 'Purchase Manager', email: 'vikram@supplychainx.com', password: 'purchase123', name: 'Vikram Singh', desc: 'Suppliers & Goods Receiving' },
  { role: 'Sales Manager', email: 'priya@supplychainx.com', password: 'sales123', name: 'Priya Patel', desc: 'Customers, Orders & Invoices' }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage or default to demo Admin
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('supplychainx_token');
      const savedUser = localStorage.getItem('supplychainx_user');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          // Verify with backend
          const res = await axiosClient.get('/auth/me');
          if (res?.user) {
            setUser(res.user);
            localStorage.setItem('supplychainx_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Session verification fallback to stored user:', err.message);
        }
      } else {
        // Auto-login as default Admin for seamless local exploration
        const defaultAdmin = {
          id: 'usr_admin',
          name: 'Rahul Sharma',
          email: 'admin@supplychainx.com',
          phone: '+91 98765 43210',
          role: 'Admin',
          department: 'Executive Management',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        };
        // We can let them log in, or keep null if on public landing page
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axiosClient.post('/auth/login', { email, password });
      if (res.success && res.token) {
        localStorage.setItem('supplychainx_token', res.token);
        localStorage.setItem('supplychainx_user', JSON.stringify(res.user));
        setUser(res.user);
        return { success: true };
      }
      throw new Error(res.message || 'Login failed');
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const register = async (userData) => {
    try {
      const res = await axiosClient.post('/auth/register', userData);
      if (res.success && res.token) {
        localStorage.setItem('supplychainx_token', res.token);
        localStorage.setItem('supplychainx_user', JSON.stringify(res.user));
        setUser(res.user);
        return { success: true };
      }
      throw new Error(res.message || 'Registration failed');
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const switchRole = async (targetRole) => {
    const cred = DEMO_CREDENTIALS.find(c => c.role === targetRole);
    if (cred) {
      return await login(cred.email, cred.password);
    }
    return { success: false, message: 'Role not found' };
  };

  const logout = () => {
    localStorage.removeItem('supplychainx_token');
    localStorage.removeItem('supplychainx_user');
    setUser(null);
  };

  const hasPermission = (permissionKey) => {
    if (!user) return false;
    const permissions = ROLE_PERMISSIONS[user.role] || {};
    return Boolean(permissions[permissionKey] || user.role === 'Admin');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        switchRole,
        hasPermission,
        isAuthenticated: Boolean(user)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
