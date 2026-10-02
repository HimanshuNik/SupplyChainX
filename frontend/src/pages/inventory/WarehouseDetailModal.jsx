import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatCurrency, formatCompactCurrency } from '../../utils/formatters';
import axiosClient from '../../api/axiosClient';
import { ArrowLeftRight, Package, MapPin, User, Phone } from 'lucide-react';

export const WarehouseDetailModal = ({ warehouseId, isOpen, onClose, onTransferClick }) => {
  const [warehouse, setWarehouse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!warehouseId) return;
      try {
        setLoading(true);
        const res = await axiosClient.get(`/warehouses/${warehouseId}`);
        if (res.success) {
          setWarehouse(res.warehouse);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) fetchDetail();
  }, [warehouseId, isOpen]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={warehouse?.name || 'Warehouse Details'}
      subtitle={`Code: ${warehouse?.code || 'N/A'} • ${warehouse?.location || ''}`}
      maxWidth="max-w-3xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="primary"
            size="sm"
            icon={ArrowLeftRight}
            onClick={onTransferClick}
          >
            Initiate Transfer From Here
          </Button>

          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      {loading ? (
        <LoadingSpinner text="Loading warehouse inventory..." />
      ) : warehouse ? (
        <div className="space-y-6">
          {/* Top 3 KPI stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Products</div>
              <div className="text-xl font-bold text-slate-900 mt-1">{warehouse.totalProducts || 6}</div>
              <div className="text-[10px] text-slate-400">active lines</div>
            </div>

            <div className="bg-blue-50 border border-blue-200/80 rounded-xl p-3 text-center">
              <div className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">Total Stock</div>
              <div className="text-xl font-bold text-blue-900 mt-1">{warehouse.totalUnits || 0}</div>
              <div className="text-[10px] text-blue-600">units in storage</div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 text-center">
              <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Stock Value</div>
              <div className="text-xl font-bold text-emerald-900 mt-1">
                {formatCompactCurrency(warehouse.stockValue || 2450000)}
              </div>
              <div className="text-[10px] text-emerald-600">inventory asset valuation</div>
            </div>
          </div>

          {/* Location & Management meta */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400">Address:</span>
              <p className="font-semibold text-slate-800 mt-0.5">{warehouse.address || 'Maharashtra Industrial Zone'}</p>
            </div>
            <div>
              <span className="text-slate-400">Warehouse Manager:</span>
              <p className="font-semibold text-slate-800 mt-0.5">{warehouse.manager}</p>
            </div>
          </div>

          {/* Products Stocked Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              On-Hand Inventory By Product
            </h4>
            <div className="border border-slate-200 rounded-lg overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3">Aisle</th>
                    <th className="py-2.5 px-3 text-right">Physical Qty</th>
                    <th className="py-2.5 px-3 text-right">Reserved</th>
                    <th className="py-2.5 px-3 text-right">Available</th>
                    <th className="py-2.5 px-3 text-right">Line Valuation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(warehouse.products || []).map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="py-2 px-3 font-semibold text-slate-800">{p.name}</td>
                      <td className="py-2 px-3 font-mono text-slate-500">{p.sku}</td>
                      <td className="py-2 px-3 text-slate-500">{p.aisleLocation}</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">{p.quantity}</td>
                      <td className="py-2 px-3 text-right text-amber-600 font-medium">{p.reservedQuantity || 0}</td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-600">{p.available}</td>
                      <td className="py-2 px-3 text-right font-mono">{formatCurrency(p.itemValue || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};
