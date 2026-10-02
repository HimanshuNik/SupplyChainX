import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';
import { formatCurrency } from '../../utils/formatters';
import axiosClient from '../../api/axiosClient';
import { CreditCard, CheckCircle2 } from 'lucide-react';

export const RecordPaymentModal = ({ invoice, isOpen, onClose, onSuccess }) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [amount, setAmount] = useState(invoice?.balanceAmount || '');
  const [method, setMethod] = useState('UPI');
  const [reference, setReference] = useState(`UPI/HDFC/${Date.now().toString().slice(-6)}`);
  const [notes, setNotes] = useState('Payment settled in full via instant transfer.');

  if (!invoice) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payAmount = Number(amount);
    if (!payAmount || payAmount <= 0) {
      addToast({ title: 'Validation', message: 'Please enter a valid payment amount > 0', type: 'warning' });
      return;
    }

    try {
      setLoading(true);
      const res = await axiosClient.post(`/invoices/${invoice._id}/payments`, {
        amount: payAmount,
        method,
        reference,
        notes
      });

      if (res.success) {
        addToast({
          title: 'Payment Recorded!',
          message: `Payment of ${formatCurrency(payAmount)} applied to ${invoice.invoiceNumber}`,
          type: 'success'
        });
        onSuccess(res.invoice);
      }
    } catch (err) {
      addToast({ title: 'Payment Failed', message: err.message || 'Error recording payment', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Record Payment for ${invoice.invoiceNumber}`}
      subtitle={`Customer: ${invoice.customerName} • Outstanding: ${formatCurrency(invoice.balanceAmount)}`}
      maxWidth="max-w-md"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="success"
            size="md"
            icon={CheckCircle2}
            loading={loading}
            onClick={handleSubmit}
          >
            Confirm & Settle
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
          <div className="flex justify-between text-slate-600">
            <span>Invoice Total:</span>
            <span className="font-bold text-slate-900 font-mono">{formatCurrency(invoice.totalAmount)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Already Paid:</span>
            <span className="font-bold text-emerald-600 font-mono">{formatCurrency(invoice.paidAmount || 0)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-200">
            <span>Remaining Balance:</span>
            <span className="text-rose-600 font-mono font-extrabold">{formatCurrency(invoice.balanceAmount)}</span>
          </div>
        </div>

        <Input
          label="Payment Amount (₹)"
          type="number"
          min="1"
          max={invoice.balanceAmount}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 10120"
          required
        />

        <Select
          label="Payment Method"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          options={['UPI', 'Bank Transfer', 'Credit Card', 'Cash', 'Cheque']}
          required
        />

        <Input
          label="Transaction / Reference ID"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="e.g. UPI/HDFC/8812903"
          required
        />

        <Input
          label="Payment Remarks"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Cleared through corporate account"
        />
      </form>
    </Modal>
  );
};
