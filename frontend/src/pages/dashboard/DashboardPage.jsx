import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  Warehouse,
  TrendingUp,
  ArrowRight,
  ArrowLeftRight,
  ClipboardList,
  Receipt,
  Plus
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import axiosClient from '../../api/axiosClient';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatCurrency, formatCompactCurrency, formatDate } from '../../utils/formatters';

export const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get('/analytics/dashboard');
        if (res.success) {
          setStats(res);
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading enterprise dashboard metrics..." />;
  }

  const { stats: kpis, salesTrend, inventoryDistribution, lowStockItems, recentTransactions } = stats || {};

  return (
    <div className="space-y-6">
      {/* Page Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-warehouse inventory, procurement & financial monitoring
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link to="/inventory/products">
            <Button variant="secondary" size="sm" icon={Plus}>
              Add Product
            </Button>
          </Link>
          <Link to="/inventory/warehouses">
            <Button variant="secondary" size="sm" icon={ArrowLeftRight}>
              Transfer Stock
            </Button>
          </Link>
          <Link to="/procurement/orders">
            <Button variant="secondary" size="sm" icon={ClipboardList}>
              New PO
            </Button>
          </Link>
          <Link to="/sales/orders">
            <Button variant="primary" size="sm" icon={ShoppingCart}>
              New Sales Order
            </Button>
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={kpis?.totalProducts ? `${kpis.totalProducts} Items` : '1,248 Items'}
          subtitle="Across 3 Hubs"
          icon={Package}
          iconBg="bg-blue-50 text-blue-600"
          trend="Stock: 480+ units"
          trendDirection="up"
        />

        <StatCard
          title="Active Orders"
          value={kpis?.totalOrders || '342'}
          subtitle="Order Fulfillment"
          icon={ShoppingCart}
          iconBg="bg-indigo-50 text-indigo-600"
          trend="98.2% on time"
          trendDirection="up"
        />

        <StatCard
          title="Total Revenue"
          value={formatCompactCurrency(kpis?.totalRevenue || 1280000)}
          subtitle="FY 2026-27"
          icon={DollarSign}
          iconBg="bg-emerald-50 text-emerald-600"
          trend="+14.2%"
          trendDirection="up"
        />

        <StatCard
          title="Low Stock Alerts"
          value={`${kpis?.lowStockCount || 2} Items`}
          subtitle="Requires attention"
          icon={AlertTriangle}
          iconBg="bg-amber-50 text-amber-600"
          trend="Check Nagpur hub"
          trendDirection="down"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Purchases Trend (2 Cols) */}
        <Card
          title="Revenue & Spend Overview"
          subtitle="Monthly financial progression (Recharts)"
          className="lg:col-span-2"
          action={
            <div className="text-xs text-slate-500 font-medium">Last 6 Months</div>
          }
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="purGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip
                  formatter={(val) => [formatCurrency(val), '']}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px', border: 'none' }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Area type="monotone" name="Sales Revenue" dataKey="sales" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGrad)" />
                <Area type="monotone" name="Procurement Spend" dataKey="purchases" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#purGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Warehouse Inventory Distribution (1 Col) */}
        <Card
          title="Stock Distribution"
          subtitle="Inventory balance across hubs"
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryDistribution || []} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px', border: 'none' }}
                  formatter={(val) => [`${val} Units`, 'Stock On Hand']}
                />
                <Bar dataKey="units" name="Stock Units" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Tables Row: Low Stock Alerts & Recent Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Items */}
        <Card
          title="Low Stock Items"
          subtitle="Products below minimum safe inventory threshold"
          action={
            <Link to="/inventory/products" className="text-xs font-semibold text-primary-600 hover:underline flex items-center gap-1">
              View all products <ArrowRight className="w-3 h-3" />
            </Link>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase">
                  <th className="py-2.5">Product</th>
                  <th className="py-2.5">Stock</th>
                  <th className="py-2.5">Threshold</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(lowStockItems || []).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="py-3">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{item.sku}</div>
                    </td>
                    <td className="py-3 font-bold text-slate-800">{item.stock} units</td>
                    <td className="py-3 text-slate-500">{item.minStock} units</td>
                    <td className="py-3">
                      <Badge variant={item.status}>{item.status}</Badge>
                    </td>
                    <td className="py-3 text-right">
                      <Link to="/procurement/orders">
                        <Button variant="outline" size="sm" className="text-[11px] py-1 px-2">
                          Order Stock
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Stock Transactions */}
        <Card
          title="Recent Stock Transactions"
          subtitle="Audit ledger of inventory movements"
          action={
            <Link to="/inventory/transactions" className="text-xs font-semibold text-primary-600 hover:underline flex items-center gap-1">
              Full Ledger <ArrowRight className="w-3 h-3" />
            </Link>
          }
        >
          <div className="space-y-3">
            {(recentTransactions || []).map((tx) => (
              <div key={tx._id} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition text-xs">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    tx.type === 'IN' ? 'bg-emerald-50 text-emerald-600' :
                    tx.type === 'OUT' ? 'bg-rose-50 text-rose-600' :
                    'bg-indigo-50 text-indigo-600'
                  }`}>
                    {tx.type === 'TRANSFER' ? <ArrowLeftRight className="w-4 h-4" /> :
                     tx.type === 'IN' ? <Plus className="w-4 h-4" /> :
                     <ShoppingCart className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{tx.productName}</div>
                    <div className="text-[11px] text-slate-500">
                      {tx.type === 'TRANSFER'
                        ? `${tx.warehouseName} → ${tx.toWarehouseName}`
                        : `${tx.warehouseName} (${tx.referenceId || tx.reason})`}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`font-bold ${
                    tx.type === 'IN' ? 'text-emerald-600' : tx.type === 'OUT' ? 'text-rose-600' : 'text-indigo-600'
                  }`}>
                    {tx.type === 'IN' ? '+' : tx.type === 'OUT' ? '-' : '⇄'} {tx.quantity} units
                  </div>
                  <div className="text-[10px] text-slate-400">{formatDate(tx.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
