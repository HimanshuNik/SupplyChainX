import React, { useState, useEffect } from 'react';
import { Receipt, Plus, Eye, Search, Download, CreditCard, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { RecordPaymentModal } from './RecordPaymentModal';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const InvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('All');
  const [search, setSearch] = useState('');

  const [paymentInvoice, setPaymentInvoice] = useState(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/invoices', {
        params: { status, search }
      });
      if (res.success) setInvoices(res.invoices || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [status]);

  const columns = [
    {
      header: 'Invoice Number',
      accessor: 'invoiceNumber',
      className: 'font-mono font-bold text-blue-700'
    },
    {
      header: 'Order Ref',
      accessor: 'salesOrderNumber',
      className: 'font-mono text-xs text-slate-500'
    },
    {
      header: 'Customer',
      render: (inv) => (
        <div>
          <div className="font-bold text-slate-900">{inv.customerName}</div>
          <div className="text-[10px] text-slate-400">{inv.customerAddress || 'Maharashtra'}</div>
        </div>
      )
    },
    {
      header: 'Invoice Date',
      render: (inv) => <span className="text-xs text-slate-600">{formatDate(inv.issueDate)}</span>
    },
    {
      header: 'Total Amount',
      render: (inv) => (
        <span className="font-mono font-bold text-sm text-slate-900">
          {formatCurrency(inv.totalAmount)}
        </span>
      )
    },
    {
      header: 'Balance Due',
      render: (inv) => (
        <span className={`font-mono text-xs font-bold ${
          inv.balanceAmount > 0 ? 'text-rose-600' : 'text-emerald-600'
        }`}>
          {formatCurrency(inv.balanceAmount)}
        </span>
      )
    },
    {
      header: 'Status',
      render: (inv) => <Badge variant={inv.status}>{inv.status}</Badge>
    },
    {
      header: 'Actions',
      align: 'right',
      render: (inv) => (
        <div className="flex items-center justify-end gap-2">
          {inv.status !== 'Paid' && (
            <Button
              variant="outline"
              size="sm"
              icon={CreditCard}
              onClick={(e) => {
                e.stopPropagation();
                setPaymentInvoice(inv);
              }}
              className="text-xs py-1 px-2.5 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
            >
              Pay
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            icon={Download}
            onClick={(e) => {
              e.stopPropagation();
              generateInvoicePDF(inv);
            }}
            title="Download PDF"
          >
            PDF
          </Button>

          <Link to={`/sales/invoices/${inv._id}`}>
            <Button variant="secondary" size="sm" icon={Eye} className="text-xs py-1 px-2.5">
              View
            </Button>
          </Link>
        </div>
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
            <span className="text-blue-600">Tax Invoices</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Commercial Invoicing & Payment Settlement
          </h1>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search invoice number, client, order ref..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchInvoices()}
            icon={Search}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Paid', label: 'Paid in Full' },
              { value: 'Partial', label: 'Partially Paid' },
              { value: 'Pending', label: 'Pending Settlement' },
              { value: 'Overdue', label: 'Overdue' }
            ]}
            className="w-48"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="Loading invoices..." />
      ) : (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
          <Table
            columns={columns}
            data={invoices}
            emptyMessage="No invoices match the selected filter."
          />
        </div>
      )}

      {/* Payment Modal */}
      {paymentInvoice && (
        <RecordPaymentModal
          invoice={paymentInvoice}
          isOpen={Boolean(paymentInvoice)}
          onClose={() => setPaymentInvoice(null)}
          onSuccess={() => {
            setPaymentInvoice(null);
            fetchInvoices();
          }}
        />
      )}
    </div>
  );
};
