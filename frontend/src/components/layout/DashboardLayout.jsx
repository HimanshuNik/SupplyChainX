import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { PlayCircle, CheckCircle2, ChevronRight, X, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const DashboardLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [showDemoStory, setShowDemoStory] = useState(true);

  // Business story steps
  const storySteps = [
    { title: '1. Inventory', link: '/inventory/products', desc: 'Browse products & multi-warehouse stock' },
    { title: '2. Stock Transfer', link: '/inventory/warehouses', desc: 'Transfer units Nagpur -> Pune' },
    { title: '3. Procurement', link: '/procurement/orders', desc: 'Approve PO & Receive Goods' },
    { title: '4. Sales Order', link: '/sales/orders', desc: 'Auto-checks stock & generates invoice' },
    { title: '5. Invoices & Pay', link: '/sales/invoices', desc: 'Download PDF & record payment' },
    { title: '6. Audit Trail', link: '/audit-logs', desc: 'Verify complete interconnected log' }
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar */}
        <Navbar />

        {/* Guided Presentation Workflow Bar (Can be dismissed or expanded) */}
        {showDemoStory && (
          <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 text-white px-4 py-2 text-xs flex items-center justify-between shadow-xs z-10 flex-shrink-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded text-[10px]">
                <Sparkles className="w-3 h-3 text-amber-300" />
                Viva Demo Workflow:
              </span>
              <div className="flex items-center gap-3 overflow-x-auto py-0.5">
                {storySteps.map((step, idx) => {
                  const isCurrent = location.pathname.startsWith(step.link);
                  return (
                    <Link
                      key={idx}
                      to={step.link}
                      className={`inline-flex items-center gap-1 font-medium transition hover:text-white ${
                        isCurrent
                          ? 'text-white underline decoration-2 decoration-amber-400 font-bold'
                          : 'text-blue-100 hover:underline'
                      }`}
                    >
                      <span>{step.title}</span>
                      {idx < storySteps.length - 1 && (
                        <ChevronRight className="w-3 h-3 opacity-60 ml-1" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
            <button
              onClick={() => setShowDemoStory(false)}
              className="text-white/70 hover:text-white p-1 rounded transition ml-2"
              title="Hide guide banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Page Content Scroll Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
