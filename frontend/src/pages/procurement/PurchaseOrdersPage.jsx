import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, CheckCircle, PackageCheck, Eye, Search, Filter } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CreatePOModal } from './CreatePOModal';
import { GoodsReceivingModal } from './GoodsReceivingModal';

export const PurchaseOrdersPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState('All');
  const [search, setSearch] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedReceivingPO, setSelectedReceivingPO] = useState(null);

  const fetchPOs = async () => {
    try {
      setLoading(true);
      const [poRes, supRes, whRes] = await Promise.all([
        axiosClient.get('/purchase-orders', { params: { status, search } }),
        axiosClient.get('/suppliers'),
        axiosClient.get('/warehouses')
      ]);

      if (poRes.success) setOrders(poRes.orders || []);
      if (supRes.success) setSuppliers(supRes.suppliers || []);
      if (whRes.success) setWarehouses(whRes.warehouses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPOs();
  }, [status]);

  const handleApprovePO = async (poId, poNumber) => {
    try {
      const res = await axiosClient.post(`/purchase-orders/${poId}/approve`);
      if (res.success) {
        addToast({ title: 'PO Approved', message: `${poNumber} has been approved for receiving!`, type: 'success' });
        fetchPOs();
      }
    } catch (err) {
      addToast({ title: 'Approval Failed', message: err.message || 'Error approving PO', type: 'error' });
    }
  };

  const columns = [
    {
      header: 'PO Number',
      accessor: 'poNumber',
      className: 'font-mono font-bold text-slate-800'
    },
    {
      header: 'Supplier',
      render: (po) => (
        <div>
          <div className="font-bold text-slate-900">{po.supplierName}</div>
          <div className="text-[10px] text-slate-400">Target: {po.warehouseName}</div>
        </div>
      )
    },
    {
      header: 'Order Date',
      render: (po) => <span className="text-xs text-slate-600">{formatDate(po.orderDate)}</span>
    },
    {
      header: 'Line Items',
      render: (po) => (
        <span className="text-xs font-semibold text-slate-700">
          {(po.items || []).length} Products
        </span>
      )
    },
    {
      header: 'Total Amount',
      render: (po) => (
        <div className="font-bold text-sm text-slate-900">
          {formatCurrency(po.totalAmount)}
        </div>
      )
    },
    {
      header: 'Status',
      render: (po) => <Badge variant={po.status}>{po.status}</Badge>
    },
    {
      header: 'Workflow Actions',
      align: 'right',
      render: (po) => {
        return (
          <div className="flex items-center justify-end gap-2">
            {po.status === 'Pending' && (
              <Button
                variant="primary"
                size="sm"
                icon={CheckCircle}
                onClick={(e) => {
                  e.stopPropagation();
                  handleApprovePO(po._id, po.poNumber);
                }}
                className="text-xs py-1 px-2.5"
              >
                Approve PO
              </Button>
            )}

            {(po.status === 'Approved' || po.status === 'Partially Received' || po.status === 'Ordered') && (
              <Button
                variant="success"
                size="sm"
                icon={PackageCheck}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedReceivingPO(po);
                }}
                className="text-xs py-1 px-2.5"
              >
                Receive Goods
              </Button>
            )}

            {po.status === 'Received' && (
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                ✓ Intake Complete
              </span>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Procurement</span>
            <span>/</span>
            <span className="text-blue-600">Purchase Orders</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Purchase Orders & Goods Inward Flow
          </h1>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setIsCreateOpen(true)}
        >
          Create Purchase Order
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search PO number or supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchPOs()}
            icon={Search}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Pending', label: 'Pending Approval' },
              { value: 'Approved', label: 'Approved (Ready to Receive)' },
              { value: 'Partially Received', label: 'Partially Received' },
              { value: 'Received', label: 'Received (Completed)' }
            ]}
            className="w-56"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="Loading purchase orders..." />
      ) : (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
          <Table
            columns={columns}
            data={orders}
            emptyMessage="No purchase orders match your filters."
          />
        </div>
      )}

      {/* Create PO Modal */}
      {isCreateOpen && (
        <CreatePOModal
          isOpen={isCreateOpen}
          suppliers={suppliers}
          warehouses={warehouses}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => {
            setIsCreateOpen(false);
            fetchPOs();
          }}
        />
      )}

      {/* Goods Receiving Modal */}
      {selectedReceivingPO && (
        <GoodsReceivingModal
          purchaseOrder={selectedReceivingPO}
          isOpen={Boolean(selectedReceivingPO)}
          onClose={() => setSelectedReceivingPO(null)}
          onSuccess={() => {
            setSelectedReceivingPO(null);
            fetchPOs();
          }}
        />
      )}
    </div>
  );
};
