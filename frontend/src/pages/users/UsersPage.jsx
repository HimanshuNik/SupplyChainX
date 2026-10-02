import React, { useState, useEffect } from 'react';
import { Users, Plus, Shield, UserCheck, UserX, Key, Search } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../components/common/Toast';
import { formatDate } from '../../utils/formatters';

export const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { addToast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/users');
      if (res.success) setUsers(res.users || []);
    } catch (err) {
      addToast({ title: 'Access Restricted', message: 'Admin privileges required to view users list', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await axiosClient.put(`/users/${user._id}`, { status: newStatus });
      if (res.success) {
        addToast({ title: 'Status Updated', message: `${user.name} is now ${newStatus}`, type: 'success' });
        fetchUsers();
      }
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to update user', type: 'error' });
    }
  };

  const columns = [
    {
      header: 'Staff Member',
      render: (u) => (
        <div className="flex items-center gap-3">
          <img
            src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
            alt={u.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div>
            <div className="font-bold text-slate-900">{u.name}</div>
            <div className="text-[11px] text-slate-400">{u.email}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Department',
      accessor: 'department',
      className: 'text-xs text-slate-600'
    },
    {
      header: 'Assigned Role',
      render: (u) => <Badge variant={u.role}>{u.role}</Badge>
    },
    {
      header: 'Account Status',
      render: (u) => <Badge variant={u.status}>{u.status}</Badge>
    },
    {
      header: 'Joined Date',
      render: (u) => <span className="text-xs text-slate-500">{formatDate(u.createdAt)}</span>
    },
    {
      header: 'Actions',
      align: 'right',
      render: (u) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleStatus(u)}
            className={`text-xs ${u.status === 'Active' ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
          >
            {u.status === 'Active' ? 'Deactivate' : 'Activate'}
          </Button>
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
            <span>Administration</span>
            <span>/</span>
            <span className="text-blue-600">Team Management</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Enterprise User Accounts & Role Permissions
          </h1>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setIsAddOpen(true)}
        >
          Add User
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading user management directory..." />
      ) : (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
          <Table
            columns={columns}
            data={users}
            emptyMessage="No users found."
          />
        </div>
      )}

      {/* Add User Modal */}
      {isAddOpen && (
        <AddUserModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onSuccess={() => {
            setIsAddOpen(false);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
};

const AddUserModal = ({ isOpen, onClose, onSuccess }) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Inventory Manager',
    department: 'Operations',
    password: ''
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      addToast({ title: 'Validation', message: 'Name, email, and password are required', type: 'warning' });
      return;
    }

    try {
      setLoading(true);
      const res = await axiosClient.post('/users', form);
      if (res.success) {
        addToast({ title: 'User Created', message: `${form.name} assigned as ${form.role}`, type: 'success' });
        onSuccess();
      }
    } catch (err) {
      addToast({ title: 'Error', message: err.message || 'Failed to create user', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Staff Account"
      subtitle="Assign operational privileges and credentials"
      maxWidth="max-w-md"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="md" loading={loading} onClick={handleSubmit}>
            Create User
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input
          label="Full Name"
          name="name"
          placeholder="e.g. Siddharth Rao"
          value={form.name}
          onChange={handleChange}
          required
        />
        <Input
          label="Email Address"
          name="email"
          type="email"
          placeholder="siddharth@supplychainx.com"
          value={form.email}
          onChange={handleChange}
          required
        />
        <Input
          label="Phone Number"
          name="phone"
          placeholder="+91 98765 00000"
          value={form.phone}
          onChange={handleChange}
        />
        <Select
          label="Role"
          name="role"
          value={form.role}
          onChange={handleChange}
          options={['Admin', 'Inventory Manager', 'Purchase Manager', 'Sales Manager']}
          required
        />
        <Input
          label="Department"
          name="department"
          placeholder="e.g. Regional Logistics"
          value={form.department}
          onChange={handleChange}
        />
        <Input
          label="Initial Password"
          name="password"
          type="password"
          placeholder="•••••••••"
          value={form.password}
          onChange={handleChange}
          required
        />
      </form>
    </Modal>
  );
};
