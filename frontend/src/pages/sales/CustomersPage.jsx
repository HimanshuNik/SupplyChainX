import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Mail, Phone, DollarSign, Building } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../components/common/Toast';
import { formatCurrency, formatCompactCurrency } from '../../utils/formatters';

export const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { addToast } = useToast();

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/customers', { params: { search } });
      if (res.success) setCustomers(res.customers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const columns = [
    {
      header: 'Customer / Client',
      render: (c) => (
        <div>
          <div className="font-bold text-slate-900">{c.name}</div>
          <div className="text-[10px] text-slate-400">{c.company || 'Retail Client'}</div>
        </div>
      )
    },
    {
      header: 'Contact Info',
      render: (c) => (
        <div className="text-xs text-slate-600 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Mail className="w-3 h-3 text-slate-400" />
            <span>{c.email}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone className="w-3 h-3 text-slate-400" />
            <span>{c.phone}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Total Orders',
      render: (c) => (
        <span className="font-bold text-slate-800 text-xs">{c.totalOrders || 0} Orders</span>
      )
    },
    {
      header: 'Total Spent',
      render: (c) => (
        <div className="font-bold text-sm text-slate-900 font-mono">
          {formatCompactCurrency(c.totalSpent || 0)}
        </div>
      )
    },
    {
      header: 'Credit Limit',
      render: (c) => (
        <span className="text-xs text-slate-600 font-mono">{formatCurrency(c.creditLimit || 500000)}</span>
      )
    },
    {
      header: 'Outstanding Receivable',
      render: (c) => (
        <div className={`font-mono text-xs font-bold ${
          c.outstandingReceivable > 0 ? 'text-amber-600' : 'text-slate-400'
        }`}>
          {formatCurrency(c.outstandingReceivable || 0)}
        </div>
      )
    },
    {
      header: 'Status',
      render: (c) => <Badge variant={c.status}>{c.status}</Badge>
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
            <span className="text-blue-600">Customers</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Commercial Customers & Accounts
          </h1>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setIsAddOpen(true)}
        >
          Add Customer
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <form onSubmit={(e) => { e.preventDefault(); fetchCustomers(); }} className="w-full max-w-md">
          <Input
            placeholder="Search customers by name, company, email..."
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
        <span className="text-xs text-slate-500 font-medium">
          {customers.length} Accounts Registered
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="Loading customers..." />
      ) : (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
          <Table
            columns={columns}
            data={customers}
            emptyMessage="No customer records found."
          />
        </div>
      )}

      {/* Add Customer Modal */}
      {isAddOpen && (
        <AddCustomerModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onSuccess={() => {
            setIsAddOpen(false);
            fetchCustomers();
          }}
        />
      )}
    </div>
  );
};

const AddCustomerModal = ({ isOpen, onClose, onSuccess }) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    taxId: '',
    creditLimit: '500000'
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) {
      addToast({ title: 'Validation', message: 'Name, email, and phone are required', type: 'warning' });
      return;
    }

    try {
      setLoading(true);
      const res = await axiosClient.post('/customers', form);
      if (res.success) {
        addToast({ title: 'Customer Created', message: `${form.name} registered successfully!`, type: 'success' });
        onSuccess();
      }
    } catch (err) {
      addToast({ title: 'Error', message: err.message || 'Failed to add customer', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Customer Account"
      subtitle="Register commercial client for order dispatch and invoicing"
      maxWidth="max-w-lg"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="md" loading={loading} onClick={handleSubmit}>
            Create Customer
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input
          label="Customer / Client Name"
          name="name"
          placeholder="e.g. ABC Store Enterprises"
          value={form.name}
          onChange={handleChange}
          required
        />

        <Input
          label="Company Registered Name"
          name="company"
          placeholder="e.g. ABC Store Pvt Ltd"
          value={form.company}
          onChange={handleChange}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="orders@abcstore.in"
            value={form.email}
            onChange={handleChange}
            required
          />
          <Input
            label="Phone"
            name="phone"
            placeholder="+91 91234 56780"
            value={form.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="City"
            name="city"
            placeholder="e.g. Nagpur"
            value={form.city}
            onChange={handleChange}
          />
          <Input
            label="GSTIN / Tax ID"
            name="taxId"
            placeholder="27AABCA1234F1Z8"
            value={form.taxId}
            onChange={handleChange}
          />
        </div>

        <Input
          label="Billing / Shipping Address"
          name="address"
          placeholder="Commercial Block B, MG Road"
          value={form.address}
          onChange={handleChange}
        />

        <Input
          label="Credit Limit (₹)"
          name="creditLimit"
          type="number"
          placeholder="500000"
          value={form.creditLimit}
          onChange={handleChange}
        />
      </form>
    </Modal>
  );
};
