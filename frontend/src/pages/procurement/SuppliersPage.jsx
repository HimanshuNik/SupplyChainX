import React, { useState, useEffect } from 'react';
import { Truck, Plus, Star, Phone, Mail, MapPin, DollarSign, Search } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../components/common/Toast';
import { formatCurrency } from '../../utils/formatters';

export const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { addToast } = useToast();

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/suppliers', { params: { search } });
      if (res.success) setSuppliers(res.suppliers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const columns = [
    {
      header: 'Supplier Name',
      render: (s) => (
        <div>
          <div className="font-bold text-slate-900">{s.name}</div>
          <div className="text-[10px] text-slate-400 font-mono">{s.code}</div>
        </div>
      )
    },
    {
      header: 'Contact Info',
      render: (s) => (
        <div className="text-xs text-slate-600 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Mail className="w-3 h-3 text-slate-400" />
            <span>{s.email}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone className="w-3 h-3 text-slate-400" />
            <span>{s.phone}</span>
          </div>
        </div>
      )
    },
    {
      header: 'City / Hub',
      accessor: 'city',
      className: 'text-xs text-slate-700'
    },
    {
      header: 'Payment Terms',
      accessor: 'paymentTerms',
      className: 'text-xs font-medium text-slate-700'
    },
    {
      header: 'Rating',
      render: (s) => (
        <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{s.rating || 4.5}</span>
        </div>
      )
    },
    {
      header: 'Orders Processed',
      render: (s) => (
        <div className="text-xs font-bold text-slate-800">{s.totalOrders || 0} POs</div>
      )
    },
    {
      header: 'Outstanding Payable',
      render: (s) => (
        <div className="text-xs font-bold text-slate-900 font-mono">
          {formatCurrency(s.outstandingPayable || 0)}
        </div>
      )
    },
    {
      header: 'Status',
      render: (s) => <Badge variant={s.status}>{s.status}</Badge>
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
            <span className="text-blue-600">Suppliers</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Supplier & Vendor Directory
          </h1>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setIsAddOpen(true)}
        >
          Add Supplier
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <form onSubmit={(e) => { e.preventDefault(); fetchSuppliers(); }} className="w-full max-w-md">
          <Input
            placeholder="Search suppliers by name, code, contact person..."
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
        <span className="text-xs text-slate-500 font-medium">
          {suppliers.length} Registered Suppliers
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="Loading suppliers..." />
      ) : (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
          <Table
            columns={columns}
            data={suppliers}
            emptyMessage="No suppliers found matching your query."
          />
        </div>
      )}

      {/* Add Supplier Modal */}
      {isAddOpen && (
        <AddSupplierModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onSuccess={() => {
            setIsAddOpen(false);
            fetchSuppliers();
          }}
        />
      )}
    </div>
  );
};

const AddSupplierModal = ({ isOpen, onClose, onSuccess }) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    contactPerson: '',
    address: '',
    city: '',
    paymentTerms: 'Net 30',
    rating: '4.8',
    categories: 'Electronics, Hardware'
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
      const res = await axiosClient.post('/suppliers', form);
      if (res.success) {
        addToast({ title: 'Supplier Created', message: `${form.name} registered!`, type: 'success' });
        onSuccess();
      }
    } catch (err) {
      addToast({ title: 'Error', message: err.message || 'Failed to add supplier', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register New Supplier"
      subtitle="Add verified procurement vendor to the supply directory"
      maxWidth="max-w-lg"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="md" loading={loading} onClick={handleSubmit}>
            Create Supplier
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input
          label="Company / Supplier Name"
          name="name"
          placeholder="e.g. Apex Industrial Supplies Ltd"
          value={form.name}
          onChange={handleChange}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="vendor@company.com"
            value={form.email}
            onChange={handleChange}
            required
          />
          <Input
            label="Phone"
            name="phone"
            placeholder="+91 98765 00000"
            value={form.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Contact Person"
            name="contactPerson"
            placeholder="Account Representative"
            value={form.contactPerson}
            onChange={handleChange}
          />
          <Input
            label="City"
            name="city"
            placeholder="e.g. Mumbai"
            value={form.city}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Payment Terms"
            name="paymentTerms"
            placeholder="Net 30, Net 15, Advance"
            value={form.paymentTerms}
            onChange={handleChange}
          />
          <Input
            label="Initial Rating (1 to 5)"
            name="rating"
            type="number"
            step="0.1"
            min="1"
            max="5"
            value={form.rating}
            onChange={handleChange}
          />
        </div>

        <Input
          label="Supply Categories (comma-separated)"
          name="categories"
          placeholder="Electronics, Displays, Industrial"
          value={form.categories}
          onChange={handleChange}
        />
      </form>
    </Modal>
  );
};
