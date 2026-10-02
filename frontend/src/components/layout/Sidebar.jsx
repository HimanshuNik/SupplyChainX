import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ArrowLeftRight,
  Truck,
  ClipboardList,
  Users,
  ShoppingCart,
  Receipt,
  BarChart3,
  FileSpreadsheet,
  Shield,
  History,
  Settings,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role || 'Admin';

  const navSections = [
    {
      title: 'Core Platform',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'Inventory Manager', 'Purchase Manager', 'Sales Manager'] }
      ]
    },
    {
      title: 'Inventory & Stock',
      items: [
        { name: 'Products', path: '/inventory/products', icon: Package, roles: ['Admin', 'Inventory Manager'] },
        { name: 'Warehouses', path: '/inventory/warehouses', icon: Warehouse, roles: ['Admin', 'Inventory Manager'] },
        { name: 'Stock Movements', path: '/inventory/transactions', icon: ArrowLeftRight, roles: ['Admin', 'Inventory Manager'] }
      ]
    },
    {
      title: 'Procurement',
      items: [
        { name: 'Suppliers', path: '/procurement/suppliers', icon: Truck, roles: ['Admin', 'Purchase Manager'] },
        { name: 'Purchase Orders', path: '/procurement/orders', icon: ClipboardList, roles: ['Admin', 'Purchase Manager'] }
      ]
    },
    {
      title: 'Sales & Billing',
      items: [
        { name: 'Customers', path: '/sales/customers', icon: Users, roles: ['Admin', 'Sales Manager'] },
        { name: 'Sales Orders', path: '/sales/orders', icon: ShoppingCart, roles: ['Admin', 'Sales Manager'] },
        { name: 'Invoices & Payments', path: '/sales/invoices', icon: Receipt, roles: ['Admin', 'Sales Manager'] }
      ]
    },
    {
      title: 'Analytics & Compliance',
      items: [
        { name: 'Analytics', path: '/analytics', icon: BarChart3, roles: ['Admin', 'Inventory Manager'] },
        { name: 'Reports & Exports', path: '/reports', icon: FileSpreadsheet, roles: ['Admin', 'Inventory Manager', 'Purchase Manager', 'Sales Manager'] },
        { name: 'Audit Logs', path: '/audit-logs', icon: History, roles: ['Admin'] }
      ]
    },
    {
      title: 'Administration',
      items: [
        { name: 'Team & Roles', path: '/users', icon: Shield, roles: ['Admin'] },
        { name: 'Settings', path: '/settings', icon: Settings, roles: ['Admin', 'Inventory Manager', 'Purchase Manager', 'Sales Manager'] }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 min-h-screen border-r border-slate-800 selection:bg-blue-600">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800/80 bg-slate-950/40">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-base text-white tracking-tight flex items-center gap-1.5">
              SupplyChain<span className="text-blue-500">X</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Enterprise ERP</div>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {navSections.map((section, idx) => {
          // Filter items based on active role
          const visibleItems = section.items.filter(item => item.roles.includes(role));
          if (visibleItems.length === 0) return null;

          return (
            <div key={idx}>
              <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                {section.title}
              </h3>
              <div className="space-y-1">
                {visibleItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all group ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-3">
                          <item.icon
                            className={`w-4 h-4 transition-colors ${
                              isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                            }`}
                          />
                          <span>{item.name}</span>
                        </div>
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-200" />}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Role Badge */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-slate-900/80 border border-slate-800">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold text-slate-200 truncate">{user?.name || 'Rahul Sharma'}</div>
            <div className="text-[10px] text-slate-400 truncate">{user?.role || 'Admin'}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
