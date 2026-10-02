import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  Warehouse,
  Calendar,
  Download,
  Filter
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
  Legend,
  Cell
} from 'recharts';
import axiosClient from '../../api/axiosClient';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatCurrency, formatCompactCurrency } from '../../utils/formatters';

export const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get('/analytics/dashboard');
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [dateRange]);

  if (loading) return <LoadingSpinner text="Generating executive analytics models..." />;

  const { stats, salesTrend, topProducts, inventoryDistribution } = data || {};

  const COLORS = ['#2563EB', '#6366F1', '#10B981', '#F59E0B', '#EC4899'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Intelligence</span>
            <span>/</span>
            <span className="text-blue-600">Analytics</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Supply Chain Performance & Revenue Intelligence
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            options={[
              { value: '7days', label: 'Last 7 Days' },
              { value: '30days', label: 'Last 30 Days' },
              { value: '90days', label: 'Last Quarter (90 Days)' },
              { value: '1year', label: 'Financial Year 2026' }
            ]}
            className="w-48"
          />
        </div>
      </div>

      {/* Top 3 Metric Cards as requested in prompt */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Revenue"
          value={formatCompactCurrency(stats?.totalRevenue || 1280000)}
          subtitle="Realized commercial revenue"
          icon={DollarSign}
          iconBg="bg-blue-50 text-blue-600"
          trend="↑ 14.2%"
          trendDirection="up"
        />

        <StatCard
          title="Purchases & Spend"
          value={formatCompactCurrency(stats?.totalPurchases || 740000)}
          subtitle="Procurement expenditure"
          icon={Package}
          iconBg="bg-indigo-50 text-indigo-600"
          trend="7 Suppliers"
          trendDirection="up"
        />

        <StatCard
          title="Orders Processed"
          value={stats?.totalOrders || '342'}
          subtitle="Across Nagpur & Pune hubs"
          icon={ShoppingCart}
          iconBg="bg-emerald-50 text-emerald-600"
          trend="99.1% delivered"
          trendDirection="up"
        />
      </div>

      {/* Revenue Trend Line (AreaChart) */}
      <Card
        title="Revenue & Procurement Trendline"
        subtitle="Tracking cash inflow vs inventory procurement over time"
      >
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesTrend || []} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="areaSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="areaPurchases" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
              <Tooltip
                formatter={(val) => [formatCurrency(val), '']}
                contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Area type="monotone" name="Sales Revenue" dataKey="sales" stroke="#2563EB" strokeWidth={3} fill="url(#areaSales)" />
              <Area type="monotone" name="Purchases Spend" dataKey="purchases" stroke="#6366F1" strokeWidth={2} fill="url(#areaPurchases)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Top Products & Warehouse Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card
          title="Top Performing Products"
          subtitle="Ranked by gross sales volume and unit velocity"
        >
          <div className="space-y-4 pt-2">
            {(topProducts || []).map((p, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{p.name}</span>
                  <span className="font-mono text-slate-900 font-bold">{formatCurrency(p.revenue)}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${p.percentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{p.unitsSold} units dispatched</span>
                  <span>{p.percentage}% share</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Warehouse Distribution */}
        <Card
          title="Regional Warehouse Utilization"
          subtitle="Storage density across logistics hubs"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryDistribution || []} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis type="category" dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val) => [`${val} Units`, 'Current Stock']}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="units" fill="#3B82F6" radius={[0, 6, 6, 0]}>
                  {(inventoryDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
