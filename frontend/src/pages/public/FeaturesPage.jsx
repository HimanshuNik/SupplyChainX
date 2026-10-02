import React from 'react';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { Package, Warehouse, ShoppingCart, Truck, ShieldCheck, FileSpreadsheet, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';

export const FeaturesPage = () => {
  const features = [
    {
      icon: Package,
      title: 'Multi-Warehouse Inventory Control',
      desc: 'Centralized stock ledger tracking physical inventory across diverse distribution hubs like Nagpur, Pune, and Mumbai. Provides SKU tracking, safety stock levels, and real-time out-of-stock prevention.',
      highlights: ['SKU & Category Hierarchies', 'Location-specific Aisle Mapping', 'Dynamic Low-stock Badges', 'Stock Audit Adjustments']
    },
    {
      icon: Warehouse,
      title: 'Atomic Inter-Warehouse Transfers',
      desc: 'Move goods between storage centers seamlessly. The backend ensures atomic deductions from source hubs and simultaneous increments at destination hubs with transaction tracking.',
      highlights: ['Source & Destination Validation', 'Reason Tracking & Audit Codes', 'Prevent Negative Inventory', 'Automated Notifications']
    },
    {
      icon: Truck,
      title: 'Procurement & Purchase Lifecycle',
      desc: 'End-to-end purchasing workflow from PO draft to executive approval, supplier tracking, and partial/complete goods receiving.',
      highlights: ['Vendor Rating System', 'PO Status State Machine', 'Goods Receiving Inspection', 'Automated Inventory Ingestion']
    },
    {
      icon: ShoppingCart,
      title: 'Sales & Client Order Processing',
      desc: 'Validate customer orders directly against actual on-hand quantities. Automatically generates invoices and handles delivery status updates.',
      highlights: ['Pre-Order Stock Reservation', 'Real-time Stock Validation', 'Client Credit Limit Tracking', 'Multi-line Item Orders']
    },
    {
      icon: FileSpreadsheet,
      title: 'GST-Compliant Invoicing & Payments',
      desc: 'Instant invoice generation with client-side PDF export (jsPDF), tracking of partial payments (UPI, Bank Transfer, Card), and outstanding balances.',
      highlights: ['GST Breakdown (18%)', 'Instant PDF Download', 'Multi-method Payment Ledger', 'Overdue Tracking']
    },
    {
      icon: ShieldCheck,
      title: 'Tamper-Proof Audit Trail & Security',
      desc: 'Enterprise RBAC enforcing strict role separation between Admin, Inventory Manager, Purchase Manager, and Sales Manager with full event logging.',
      highlights: ['JWT & Bcrypt Encryption', 'Action-level Audit Logs with IP', 'Dynamic Role Navigation', 'Instant Persona Switcher']
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <PublicNavbar />

      <div className="bg-white border-b border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Platform Capabilities
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Enterprise Features Designed for Real-World Supply Chains
          </h1>
          <p className="mt-4 text-base text-slate-600 max-w-2xl mx-auto">
            Discover the modules that power SupplyChainX, built with interconnected workflow integrity.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:shadow-soft transition">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <feat.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{feat.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">{feat.desc}</p>
              <div className="border-t border-slate-100 pt-3">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Key Highlights</h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {feat.highlights.map((h, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-blue-600 rounded-2xl p-8 sm:p-12 text-center text-white">
          <h3 className="text-2xl font-bold">Ready to test these capabilities in your presentation?</h3>
          <p className="text-sm text-blue-100 mt-2 max-w-xl mx-auto">
            Login directly using our pre-seeded persona credentials and explore the full suite.
          </p>
          <div className="mt-6">
            <Link to="/login">
              <Button variant="secondary" size="md" icon={ArrowRight} iconPosition="right">
                Explore Live Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
};
