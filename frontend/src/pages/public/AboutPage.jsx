import React from 'react';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { CheckCircle2, Code2, Database, Layers, Server } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <PublicNavbar />

      <div className="bg-white border-b border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Major Project Documentation
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            About SupplyChainX & System Architecture
          </h1>
          <p className="mt-4 text-base text-slate-600 max-w-2xl mx-auto">
            A production-grade Multi-Warehouse Inventory, Procurement & Sales Management platform engineered for academic and commercial excellence.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12 flex-1">
        {/* Project Objectives */}
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Project Purpose & Objectives</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Traditional college inventory projects are often implemented as standalone CRUD tables with no business interconnectedness. SupplyChainX solves this by creating a true closed-loop ERP: Purchase Orders automatically replenish specific warehouse stock upon goods receiving; Sales Orders validate and deplete stock atomically; Invoices are spawned dynamically with payment reconciliations; and every transaction is permanently logged to an audit timeline.
          </p>
        </div>

        {/* Tech Stack */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Frontend Technology</h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> React 18 + Vite for high performance</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Tailwind CSS enterprise design system</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> React Router v6 nested layouts</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Recharts data visualization</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> jsPDF client-side document generation</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
                <Server className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Backend Technology</h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Node.js & Express REST API</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Dual-mode: MongoDB Mongoose + Embedded fast store</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> JWT Bearer tokens & Bcrypt hashing</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Role-based authorization middleware</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Audit logging & stock ledger atomicity</li>
            </ul>
          </div>
        </div>

        {/* ER Model Highlights */}
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-3">Data Model & Entity Relationships</h2>
          <div className="p-4 bg-slate-900 text-slate-200 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
            {`Supplier (SUP-001) ──► PurchaseOrder (PO-1001) ──► GoodsReceiving ──► Inventory (Nagpur) [Qty +50]
                                                                        │
                                                                        ▼
Customer (CUST-001) ◄── Invoice (INV-2001) ◄── SalesOrder (SO-2001) ─── StockDeduction (Nagpur) [Qty -5]
       │                        │
       ▼                        ▼
Payment (UPI) ────────► Balance Due: ₹0 ──► Dashboard Analytics & AuditLog Verified`}
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
};
