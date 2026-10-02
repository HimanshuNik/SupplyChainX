import React, { useState, useEffect } from 'react';
import { Warehouse, Plus, ArrowLeftRight, MapPin, Phone, User, Package, DollarSign, Layers } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StockTransferModal } from './StockTransferModal';
import { WarehouseDetailModal } from './WarehouseDetailModal';
import { AddWarehouseModal } from './AddWarehouseModal';
import { formatCurrency, formatCompactCurrency } from '../../utils/formatters';

export const WarehousesPage = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
  const [transferSourceWh, setTransferSourceWh] = useState(null);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/warehouses');
      if (res.success) {
        setWarehouses(res.warehouses || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Inventory</span>
            <span>/</span>
            <span className="text-blue-600">Warehouses</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Regional Warehouses & Distribution Hubs
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="md"
            icon={ArrowLeftRight}
            onClick={() => {
              setTransferSourceWh(null);
              setIsTransferOpen(true);
            }}
          >
            Transfer Stock
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setIsAddOpen(true)}
          >
            Add Warehouse
          </Button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading warehouses..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {warehouses.map((wh) => (
            <Card
              key={wh._id}
              className="hover:border-blue-300 transition duration-200 flex flex-col justify-between"
              headerClassName="px-5 py-4 border-b border-slate-100 flex items-start justify-between"
              action={
                <Badge variant={wh.status || 'Active'}>{wh.status || 'Active'}</Badge>
              }
              title={
                <div>
                  <div className="font-extrabold text-base text-slate-900">{wh.name}</div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{wh.location}</span>
                  </div>
                </div>
              }
            >
              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4 text-center">
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">Products</div>
                  <div className="text-lg font-bold text-slate-900 mt-0.5">{wh.totalProducts || 6}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">Total Units</div>
                  <div className="text-lg font-bold text-blue-600 mt-0.5">{wh.totalUnits || 0}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">Stock Value</div>
                  <div className="text-lg font-bold text-emerald-600 mt-0.5">
                    {formatCompactCurrency(wh.stockValue || 2450000)}
                  </div>
                </div>
              </div>

              {/* Warehouse Capacity Bar */}
              <div className="space-y-1.5 mb-5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-medium">Capacity Utilization</span>
                  <span className="font-bold text-slate-900">{wh.utilization || 24.5}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, wh.utilization || 25)}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400">
                  {wh.totalUnits || 0} of {wh.capacityUnits?.toLocaleString('en-IN') || '50,000'} max units
                </div>
              </div>

              {/* Staff contact */}
              <div className="text-xs text-slate-500 space-y-1 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Manager: <strong className="text-slate-700">{wh.manager}</strong></span>
                </div>
                {wh.contactPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{wh.contactPhone}</span>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={ArrowLeftRight}
                  onClick={() => {
                    setTransferSourceWh(wh._id);
                    setIsTransferOpen(true);
                  }}
                  className="flex-1 text-xs"
                >
                  Transfer
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedWarehouseId(wh._id)}
                  className="flex-1 text-xs"
                >
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Stock Transfer Modal */}
      {isTransferOpen && (
        <StockTransferModal
          isOpen={isTransferOpen}
          initialFromWhId={transferSourceWh}
          onClose={() => setIsTransferOpen(false)}
          onSuccess={() => {
            setIsTransferOpen(false);
            fetchWarehouses();
          }}
        />
      )}

      {/* Warehouse Detail Modal */}
      {selectedWarehouseId && (
        <WarehouseDetailModal
          warehouseId={selectedWarehouseId}
          isOpen={Boolean(selectedWarehouseId)}
          onClose={() => setSelectedWarehouseId(null)}
          onTransferClick={() => {
            setTransferSourceWh(selectedWarehouseId);
            setSelectedWarehouseId(null);
            setIsTransferOpen(true);
          }}
        />
      )}

      {/* Add Warehouse Modal */}
      {isAddOpen && (
        <AddWarehouseModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onSuccess={() => {
            setIsAddOpen(false);
            fetchWarehouses();
          }}
        />
      )}
    </div>
  );
};
