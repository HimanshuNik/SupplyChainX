import React from 'react';

const STATUS_MAP = {
  // Inventory status
  'Available': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Low Stock': 'bg-amber-50 text-amber-700 border-amber-200',
  'Out Stock': 'bg-rose-50 text-rose-700 border-rose-200',
  'Healthy': 'bg-emerald-50 text-emerald-700 border-emerald-200',

  // PO & Order status
  'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
  'Approved': 'bg-blue-50 text-blue-700 border-blue-200',
  'Ordered': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Partially Received': 'bg-purple-50 text-purple-700 border-purple-200',
  'Received': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Processing': 'bg-blue-50 text-blue-700 border-blue-200',
  'Dispatched': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Cancelled': 'bg-slate-100 text-slate-600 border-slate-200',

  // Payment status
  'Paid': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Partial': 'bg-amber-50 text-amber-700 border-amber-200',
  'Overdue': 'bg-rose-50 text-rose-700 border-rose-200',

  // General & Roles
  'Active': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Inactive': 'bg-slate-100 text-slate-600 border-slate-200',
  'Admin': 'bg-rose-50 text-rose-700 border-rose-200',
  'Inventory Manager': 'bg-blue-50 text-blue-700 border-blue-200',
  'Purchase Manager': 'bg-purple-50 text-purple-700 border-purple-200',
  'Sales Manager': 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export const Badge = ({
  children,
  variant,
  size = 'sm',
  className = '',
  dot = true
}) => {
  const badgeStyle = variant ? STATUS_MAP[variant] || 'bg-slate-100 text-slate-700 border-slate-200' : STATUS_MAP[children] || 'bg-slate-100 text-slate-700 border-slate-200';
  
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-full ${
        size === 'xs' ? 'px-2 py-0.5 text-[10px]' : size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'
      } ${badgeStyle} ${className}`}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />}
      {children}
    </span>
  );
};
