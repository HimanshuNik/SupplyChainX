import React from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Warehouse,
  ShoppingCart,
  ClipboardList,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Layers,
  ArrowLeftRight,
  FileText,
  Sparkles
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200 bg-white">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Enterprise Multi-Warehouse ERP Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Manage Your Entire <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Supply Chain</span> From One Powerful Platform
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-medium">
            Inventory • Procurement • Warehousing • Sales Orders • Invoicing • Analytics
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register">
              <Button size="lg" icon={ArrowRight} iconPosition="right" className="w-full sm:w-auto shadow-md shadow-blue-500/20">
                Get Started Free
              </Button>
            </Link>
            <Link to="/features">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Explore Features
              </Button>
            </Link>
          </div>

          {/* Live Preview Dashboard Mock */}
          <div className="mt-12 max-w-5xl mx-auto rounded-2xl border border-slate-200/80 bg-white p-2 sm:p-4 shadow-2xl shadow-blue-900/5">
            <div className="rounded-xl bg-slate-900 text-white p-4 sm:p-6 text-left">
              {/* Fake Dashboard Top Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="ml-2 text-xs font-mono text-slate-400">supplychainx-enterprise.dashboard</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </div>
              </div>

              {/* Fake Dashboard KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
                <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700/60">
                  <div className="text-xs text-slate-400 font-medium uppercase">Total Products</div>
                  <div className="text-2xl font-bold text-white mt-1">1,248 Units</div>
                  <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> 3 Warehouses Active
                  </div>
                </div>
                <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700/60">
                  <div className="text-xs text-slate-400 font-medium uppercase">Active Orders</div>
                  <div className="text-2xl font-bold text-white mt-1">342 Dispatched</div>
                  <div className="text-xs text-blue-400 mt-1">98.4% Fulfillment Rate</div>
                </div>
                <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700/60">
                  <div className="text-xs text-slate-400 font-medium uppercase">Total Revenue</div>
                  <div className="text-2xl font-bold text-white mt-1">₹12.8 Lakhs</div>
                  <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +14.2% this month
                  </div>
                </div>
              </div>

              {/* Fake Workflow Preview */}
              <div className="mt-4 p-3 bg-slate-800/40 rounded-lg border border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400">⚠ Low Stock Alert:</span>
                  <span>Precision Mouse (8 units left at Nagpur Central Hub)</span>
                </div>
                <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold underline">
                  Launch Interactive Demo →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Workflow Section (The Key Project USP) */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              One Unified Interconnected Business Story
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Unlike ordinary CRUD applications, SupplyChainX manages state transitions seamlessly across modules:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm mb-3">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900">Purchase & Receive</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                PO created with supplier → Admin approves → Goods received inspection → Multi-warehouse stock automatically increases.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm mb-3">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900">Atomic Stock Transfer</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Inter-warehouse rebalancing (e.g. Nagpur to Pune). Deducts source, increments destination, and audits the trail atomically.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm mb-3">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900">Sales Order & Invoicing</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Real-time stock validation prevents overselling → Inventory deducts instantly → Tax invoice generated with downloadable PDF.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm mb-3">
                04
              </div>
              <h3 className="text-base font-bold text-slate-900">Settlement & Audit</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Payment recording (UPI/Bank/Card) balances invoices → Dashboard charts update → Audit log captures every event with IP.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Enterprise Ready Feature Matrix
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Engineered with clean architectural patterns for production scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <Package className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Multi-Warehouse Inventory</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Track SKUs across Nagpur, Pune, and Mumbai hubs. Set minimum safety thresholds with auto low-stock triggers.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <Warehouse className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Warehouse Transfers</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Execute cross-hub stock balancing with immediate source deduction and destination intake validation.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <ClipboardList className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Procurement & POs</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Full PO lifecycle: Draft, Approval, Receiving inspection, Supplier ratings, and automated inventory sync.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Sales Orders & Invoicing</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Check stock availability in real-time. Generate GST-compliant invoices with client-side jsPDF rendering.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition">
              <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Advanced Analytics</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Interactive charts powered by Recharts: monthly revenue trends, warehouse distribution, and exportable CSV/PDF reports.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition">
              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Role-Based Security</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Granular RBAC for Admin, Inventory Manager, Purchase Manager, and Sales Manager with full tamper-proof audit trails.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight">Ready to see SupplyChainX in action?</h2>
          <p className="mt-3 text-sm text-blue-100 max-w-xl mx-auto">
            Experience the complete enterprise workflow. Instant access with pre-configured demo personas.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/login">
              <Button variant="secondary" size="lg" className="text-blue-700 font-bold">
                Launch Live Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};
