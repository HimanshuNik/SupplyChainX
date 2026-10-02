import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Tabs } from '../../components/common/Tabs';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Warehouse, ArrowLeftRight, Clock, ShieldCheck } from 'lucide-react';

export const ProductDetailModal = ({ product, isOpen, onClose, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!product) return null;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'stock', label: 'Stock by Warehouse' },
    { id: 'transactions', label: 'Recent Transactions' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product.name}
      subtitle={`SKU: ${product.sku} • Category: ${product.category}`}
      maxWidth="max-w-2xl"
      footer={
        <Button variant="secondary" size="sm" onClick={onClose}>
          Close
        </Button>
      }
    >
      {/* 3 Top Summary Boxes as requested */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 text-center">
          <div className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">Available</div>
          <div className="text-2xl font-black text-blue-900 mt-1">{product.availableStock || product.totalStock}</div>
          <div className="text-[10px] text-blue-600 mt-0.5">{product.unit || 'units'} ready</div>
        </div>

        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-center">
          <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Reserved</div>
          <div className="text-2xl font-black text-amber-900 mt-1">{product.reservedStock || 0}</div>
          <div className="text-[10px] text-amber-600 mt-0.5">held in orders</div>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 text-center">
          <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Total Sold</div>
          <div className="text-2xl font-black text-emerald-900 mt-1">124</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">lifetime units</div>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-4" />

      {activeTab === 'overview' && (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-slate-400 font-medium">Selling Price:</span>
              <span className="ml-2 font-bold text-slate-800">{formatCurrency(product.sellingPrice)}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Purchase Cost:</span>
              <span className="ml-2 font-bold text-slate-800">{formatCurrency(product.purchasePrice)}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Tax / GST:</span>
              <span className="ml-2 font-bold text-slate-800">{product.taxRate || 18}%</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Preferred Supplier:</span>
              <span className="ml-2 font-bold text-slate-800">{product.preferredSupplier || 'ABC Technologies Ltd'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Safe Stock Level:</span>
              <span className="ml-2 font-bold text-slate-800">{product.minStockLevel || 10} units</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Status:</span>
              <span className="ml-2"><Badge variant={product.status}>{product.status}</Badge></span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 mb-1">Description</h4>
            <p className="text-slate-600 leading-relaxed bg-white border border-slate-200 p-3 rounded-lg">
              {product.description || 'No extended description recorded.'}
            </p>
          </div>
        </div>
      )}

      {activeTab === 'stock' && (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Stock Distribution by Warehouse
          </div>
          {(product.warehouseStock || [
            { warehouseName: 'Nagpur Central Hub', location: 'Nagpur', quantity: 20 },
            { warehouseName: 'Pune Distribution Center', location: 'Pune', quantity: 18 },
            { warehouseName: 'Mumbai Port Logistics Terminal', location: 'Mumbai', quantity: 10 }
          ]).map((wh, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                  <Warehouse className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">{wh.warehouseName}</div>
                  <div className="text-[11px] text-slate-400">{wh.location} • Aisle {wh.aisleLocation || 'A-01'}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-black text-slate-900">{wh.quantity} units</div>
                <div className="text-[10px] text-slate-400">Available on hand</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Recent Stock In/Out & Transfers
          </div>
          {(product.transactions && product.transactions.length > 0 ? product.transactions : [
            { type: 'IN', quantity: 50, warehouseName: 'Nagpur Central Hub', reason: 'PO-1001 Goods Received', createdAt: '2026-09-22T14:30:00Z' },
            { type: 'TRANSFER', quantity: 20, warehouseName: 'Nagpur to Pune', reason: 'Stock balancing TR-8812', createdAt: '2026-09-24T10:15:00Z' },
            { type: 'OUT', quantity: 5, warehouseName: 'Nagpur Central Hub', reason: 'Sales Order SO-2001', createdAt: '2026-09-25T11:45:00Z' }
          ]).map((t, idx) => (
            <div key={idx} className="p-2.5 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className={`font-bold mr-2 ${
                  t.type === 'IN' ? 'text-emerald-600' : t.type === 'OUT' ? 'text-rose-600' : 'text-blue-600'
                }`}>
                  [{t.type}]
                </span>
                <span className="text-slate-700 font-medium">{t.reason}</span>
              </div>
              <div className="text-right">
                <div className="font-bold">{t.quantity} units</div>
                <div className="text-[10px] text-slate-400">{formatDate(t.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};
