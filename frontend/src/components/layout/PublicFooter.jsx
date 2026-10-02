import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, Heart } from 'lucide-react';

export const PublicFooter = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Layers className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-white text-lg">SupplyChainX</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enterprise Multi-Warehouse Inventory, Procurement & Sales Management Platform built for modern logistics organizations.
            </p>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Product</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/features" className="hover:text-white transition">Inventory Management</Link></li>
              <li><Link to="/features" className="hover:text-white transition">Multi-Warehouse Transfers</Link></li>
              <li><Link to="/features" className="hover:text-white transition">Procurement & POs</Link></li>
              <li><Link to="/features" className="hover:text-white transition">Sales Orders & Invoicing</Link></li>
            </ul>
          </div>

          {/* Enterprise */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Architecture</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/about" className="hover:text-white transition">System Design</Link></li>
              <li><Link to="/about" className="hover:text-white transition">MERN Stack Workflow</Link></li>
              <li><Link to="/about" className="hover:text-white transition">Role-Based Access Control</Link></li>
              <li><Link to="/about" className="hover:text-white transition">MongoDB Aggregations</Link></li>
            </ul>
          </div>

          {/* College Project Meta */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Major Project</h4>
            <p className="text-xs text-slate-400 mb-3">
              Designed & Developed as an Enterprise Capstone Major Project with production MERN architecture.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 text-[11px] text-slate-300 font-mono">
              <span>Stack: React • Node • Mongo</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} SupplyChainX. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> for Final Year Major Project
          </p>
        </div>
      </div>
    </footer>
  );
};
