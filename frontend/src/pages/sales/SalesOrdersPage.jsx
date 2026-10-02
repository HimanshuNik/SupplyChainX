import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Eye, Search, Filter, Receipt, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../components/common/Toast';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CreateSalesOrderModal } from './CreateSalesOrderModal';

export const SalesOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const [soRes, custRes, whRes] = await Promise.all([
        axiosClient.get('/sales-orders', { params: { status, search } }),
        axiosClient.get('/customers'),
        axiosClient.get('/warehouses')
      ]);

      if (soRes.success) setOrders(soRes.orders || []);
      if (custRes.success) setCustomers(custRes.customers || []);
      if (whRes.success) setWarehouses(whRes.warehouses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [status]);

  const columns = [
    {
      header: 'Order Ref',
      accessor: 'orderNumber',
      className: 'font-mono font-bold text-slate-900'
    },
    {
      header: 'Customer',
      render: (so) => (
        <div>
          <div className="font-bold text-slate-900">{so.customerName}</div>
          <div className="text-[10px] text-slate-400">Hub: {so.warehouseName}</div>
        </div>
      )
    },
    {
      header: 'Date',
      render: (so) => <span className="text-xs text-slate-600">{formatDate(so.orderDate)}</span>
    },
    {
      header: 'Items Dispatched',
      render: (so) => (
        <span className="text-xs font-semibold text-slate-700">
          {(so.items || []).reduce((acc, it) => acc + (it.quantity || 0), 0)} Units ({(so.items || []).length} products)
        </span>
      )
    },
    {
      header: 'Order Amount',
      render: (so) => (
        <div className="font-bold text-sm text-slate-900 font-mono">
          {formatCurrency(so.totalAmount)}
        </div>
      )
    },
    {
      header: 'Order Status',
      render: (so) => <Badge variant={so.status}>{so.status}</Badge>
    },
    {
      header: 'Payment Status',
      render: (so) => <Badge variant={so.paymentStatus}>{so.paymentStatus}</Badge>
    },
    {
      header: 'Actions',
      align: 'right',
      render: (so) => (
        <Link to="/sales/invoices">
          <Button variant="outline" size="sm" icon={Receipt} className="text-xs py-1 px-2.5">
            View Invoice
          </Button>
        </Link>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Sales</span>
            <span>/</span>
            <span className="text-blue-600">Sales Orders</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Sales Order Processing & Dispatch Ledger
          </h1>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setIsCreateOpen(true)}
        >
          Create Sales Order
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search order ref or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
            icon={Search}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Confirmed', label: 'Confirmed' },
              { value: 'Processing', label: 'Processing' },
              { value: 'Completed', label: 'Completed' }
            ]}
            className="w-48"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="Loading sales orders..." />
      ) : (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
          <Table
            columns={columns}
            data={orders}
            emptyMessage="No sales orders match your criteria."
          />
        </div>
      )}

      {/* Create Order Modal */}
      {isCreateOpen && (
        <CreateSalesOrderModal
          isOpen={isCreateOpen}
          customers={customers}
          warehouses={warehouses}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={(order, invoice) => {
            setIsCreateOpen(false);
            fetchOrders();
          }}
        />
      )}
    </div>
  );
};
