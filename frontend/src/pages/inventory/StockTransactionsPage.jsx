import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, Filter, Download, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDate, formatDateTime } from '../../utils/formatters';
import { exportReportToCSV } from '../../utils/pdfGenerator';

export const StockTransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('All');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/inventory/transactions', {
        params: { type }
      });
      if (res.success) {
        setTransactions(res.transactions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [type]);

  const columns = [
    {
      header: 'Timestamp',
      render: (t) => (
        <div>
          <div className="font-semibold text-slate-800 text-xs">{formatDateTime(t.createdAt)}</div>
          <div className="text-[10px] text-slate-400 font-mono">{t.referenceId || 'N/A'}</div>
        </div>
      )
    },
    {
      header: 'Type',
      render: (t) => {
        const typeStyle =
          t.type === 'IN' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
          t.type === 'OUT' ? 'bg-rose-50 text-rose-700 border-rose-200' :
          t.type === 'TRANSFER' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
          'bg-amber-50 text-amber-700 border-amber-200';

        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${typeStyle}`}>
            {t.type === 'IN' && <ArrowDownRight className="w-3 h-3" />}
            {t.type === 'OUT' && <ArrowUpRight className="w-3 h-3" />}
            {t.type === 'TRANSFER' && <ArrowLeftRight className="w-3 h-3" />}
            {t.type}
          </span>
        );
      }
    },
    {
      header: 'Product',
      render: (t) => (
        <div>
          <div className="font-bold text-slate-900">{t.productName}</div>
          <div className="text-[10px] text-slate-400 font-mono">{t.sku}</div>
        </div>
      )
    },
    {
      header: 'Warehouse / Route',
      render: (t) => (
        <div className="text-xs">
          {t.type === 'TRANSFER' ? (
            <span className="font-semibold text-indigo-700">
              {t.warehouseName} → {t.toWarehouseName}
            </span>
          ) : (
            <span className="text-slate-800">{t.warehouseName}</span>
          )}
        </div>
      )
    },
    {
      header: 'Movement Qty',
      render: (t) => (
        <div className={`font-black text-sm ${
          t.type === 'IN' ? 'text-emerald-600' : t.type === 'OUT' ? 'text-rose-600' : 'text-indigo-600'
        }`}>
          {t.type === 'IN' ? '+' : t.type === 'OUT' ? '-' : '⇄'} {t.quantity}
        </div>
      )
    },
    {
      header: 'Stock Delta',
      render: (t) => (
        <div className="text-xs text-slate-500 font-mono">
          {t.previousQuantity} → <strong className="text-slate-800">{t.newQuantity}</strong>
        </div>
      )
    },
    {
      header: 'Reason & Actor',
      render: (t) => (
        <div>
          <div className="text-slate-700 text-xs font-medium">{t.reason || 'Inventory operation'}</div>
          <div className="text-[10px] text-slate-400">By: {t.performedBy || 'System'}</div>
        </div>
      )
    }
  ];

  const handleExportCSV = () => {
    const csvColumns = [
      { key: 'createdAt', header: 'Timestamp' },
      { key: 'type', header: 'Type' },
      { key: 'sku', header: 'SKU' },
      { key: 'productName', header: 'Product' },
      { key: 'warehouseName', header: 'Warehouse' },
      { key: 'quantity', header: 'Quantity' },
      { key: 'reason', header: 'Reason' },
      { key: 'performedBy', header: 'Performed By' }
    ];
    exportReportToCSV(csvColumns, transactions, 'Stock_Transactions_Ledger');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Inventory</span>
            <span>/</span>
            <span className="text-blue-600">Stock Movements</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Immutable Stock Transaction Ledger
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={Download} onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={fetchTransactions}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filter By Type:</span>
          <Select
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={[
              { value: 'All', label: 'All Movement Types' },
              { value: 'IN', label: 'Stock Inward (Purchases / Intake)' },
              { value: 'OUT', label: 'Stock Outward (Sales Dispatches)' },
              { value: 'TRANSFER', label: 'Inter-Warehouse Transfers' },
              { value: 'ADJUSTMENT', label: 'Audits & Corrections' }
            ]}
            className="w-56"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing {transactions.length} recorded movements
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="Loading transaction audit ledger..." />
      ) : (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
          <Table
            columns={columns}
            data={transactions}
            emptyMessage="No stock movements recorded for this filter."
          />
        </div>
      )}
    </div>
  );
};
