import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Printer,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Layers,
  FileCheck
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { RecordPaymentModal } from './RecordPaymentModal';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const InvoiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPayOpen, setIsPayOpen] = useState(false);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/invoices/${id}`);
      if (res.success) setInvoice(res.invoice);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  if (loading) return <LoadingSpinner text="Rendering tax invoice..." />;
  if (!invoice) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-bold text-slate-800">Invoice Not Found</h2>
        <Link to="/sales/invoices" className="text-xs text-blue-600 underline mt-2 block">
          Return to Invoices List
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    generateInvoicePDF(invoice);
  };

  const paymentStatuses = ['Paid', 'Partial', 'Pending', 'Overdue'];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/sales/invoices" className="p-2 text-slate-400 hover:text-slate-800 hover:bg-white rounded-lg transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                {invoice.invoiceNumber}
              </h1>
              <Badge variant={invoice.status}>{invoice.status}</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Order Reference: <strong className="text-slate-700">{invoice.salesOrderNumber}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            icon={Printer}
            onClick={handlePrint}
          >
            Print
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={handleDownloadPDF}
          >
            Download PDF
          </Button>

          {invoice.status !== 'Paid' && (
            <Button
              variant="success"
              size="sm"
              icon={CreditCard}
              onClick={() => setIsPayOpen(true)}
            >
              Record Payment
            </Button>
          )}
        </div>
      </div>

      {/* Main Tax Invoice Sheet */}
      <div id="printable-invoice" className="bg-white rounded-2xl border border-slate-200 shadow-card p-8 sm:p-10 space-y-8">
        {/* Invoice Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start pb-8 border-b border-slate-100 gap-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <Layers className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-2xl text-slate-900 tracking-tight">SupplyChainX</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed">
              Enterprise Multi-Warehouse Logistics & Supply Chain Solutions Pvt Ltd.<br />
              GSTIN: 27AABCS1234F1Z8
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1 text-xs">
            <h2 className="text-lg font-black text-blue-600 tracking-wide uppercase">Tax Invoice</h2>
            <div className="font-mono font-bold text-slate-900 text-sm">{invoice.invoiceNumber}</div>
            <div className="text-slate-500">Invoice Date: <strong className="text-slate-800">{formatDate(invoice.issueDate)}</strong></div>
            <div className="text-slate-500">Payment Due: <strong className="text-slate-800">{formatDate(invoice.dueDate)}</strong></div>
          </div>
        </div>

        {/* Bill To */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-2">Billed To (Client):</h4>
            <div className="text-sm font-bold text-slate-900">{invoice.customerName}</div>
            <div className="text-slate-600 mt-1 leading-relaxed">{invoice.customerAddress || 'Maharashtra, India'}</div>
            {invoice.customerEmail && <div className="text-slate-500 mt-1">Email: {invoice.customerEmail}</div>}
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-2">Payment Terms:</h4>
              <div className="text-xs text-slate-700 font-semibold">Immediate / Net 15 Days</div>
              <div className="text-[11px] text-slate-500 mt-1">Accepted: UPI, Bank NEFT/RTGS, Commercial Credit Card</div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">Settlement Status:</span>
              <Badge variant={invoice.status}>{invoice.status}</Badge>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <th className="py-3 px-4 w-12">#</th>
                <th className="py-3 px-4">Item & Description</th>
                <th className="py-3 px-4 text-center w-24">Qty</th>
                <th className="py-3 px-4 text-right w-32">Unit Price</th>
                <th className="py-3 px-4 text-right w-36">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(invoice.items || []).map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3 px-4 text-slate-400 font-mono">{idx + 1}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{item.productName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{item.sku}</div>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-800">{item.quantity}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">{formatCurrency(item.totalPrice || item.quantity * item.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Calculation Summary */}
        <div className="flex justify-end">
          <div className="w-80 bg-slate-50 p-5 rounded-2xl border border-slate-200/80 text-xs space-y-2.5">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900 font-mono">{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Discount Applied:</span>
                <span className="font-mono">- {formatCurrency(invoice.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>GST / Tax (18%):</span>
              <span className="font-semibold text-slate-900 font-mono">{formatCurrency(invoice.tax)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-3 border-t border-slate-200">
              <span>Grand Total:</span>
              <span className="text-blue-600 font-mono">{formatCurrency(invoice.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-600 pt-1">
              <span>Amount Paid:</span>
              <span className="font-bold text-emerald-600 font-mono">{formatCurrency(invoice.paidAmount || 0)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-200 text-slate-900">
              <span>Balance Due:</span>
              <span className={`font-mono font-extrabold ${invoice.balanceAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {formatCurrency(invoice.balanceAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Tracking State Indicator (Section 18) */}
        <div className="pt-6 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Payment Reconciliation Status
          </h4>
          <div className="flex items-center gap-6 text-xs font-medium">
            {paymentStatuses.map((st) => {
              const isCurrent = invoice.status === st;
              return (
                <div key={st} className="flex items-center gap-2">
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    isCurrent ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className={isCurrent ? 'font-bold text-slate-900' : 'text-slate-400'}>
                    {st}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Payment History Log */}
          <div className="mt-4">
            <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Payment Transactions History
            </h5>
            {(invoice.payments && invoice.payments.length > 0) ? (
              <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 text-xs">
                {invoice.payments.map((p, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-emerald-50 text-emerald-600 font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 font-mono">{formatCurrency(p.amount)}</div>
                        <div className="text-[10px] text-slate-400">Method: {p.method} • Ref: {p.reference}</div>
                      </div>
                    </div>
                    <div className="text-right text-[11px] text-slate-500 font-medium">
                      {formatDate(p.date)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-lg text-center text-xs text-slate-400 border border-dashed border-slate-200">
                No payments recorded yet. Settle using the "Record Payment" action.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isPayOpen && (
        <RecordPaymentModal
          invoice={invoice}
          isOpen={isPayOpen}
          onClose={() => setIsPayOpen(false)}
          onSuccess={(updated) => {
            setIsPayOpen(false);
            setInvoice(updated);
          }}
        />
      )}
    </div>
  );
};
