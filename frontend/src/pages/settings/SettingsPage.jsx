import React, { useState } from 'react';
import { User, Building, Bell, Shield, Key, Save, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Tabs } from '../../components/common/Tabs';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import axiosClient from '../../api/axiosClient';

export const SettingsPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'Rahul Sharma',
    email: user?.email || 'admin@supplychainx.com',
    phone: user?.phone || '+91 98765 43210',
    department: user?.department || 'Executive Management'
  });

  const [companyForm, setCompanyForm] = useState({
    companyName: 'SupplyChainX Logistics Pvt Ltd',
    gstin: '27AABCS1234F1Z8',
    cin: 'U72900MH2026PTC123456',
    address: 'Plot 45, MIHAN SEZ, Wardha Road, Nagpur, Maharashtra',
    currency: 'INR (₹)',
    fiscalYearStart: 'April 01'
  });

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axiosClient.put('/auth/profile', profileForm);
      if (res.success) {
        addToast({ title: 'Profile Updated', message: 'User profile details saved successfully!', type: 'success' });
      }
    } catch (err) {
      addToast({ title: 'Update Failed', message: err.message || 'Error updating profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySave = (e) => {
    e.preventDefault();
    addToast({ title: 'Company Settings Saved', message: 'Corporate organization settings updated!', type: 'success' });
  };

  const tabs = [
    { id: 'profile', label: 'User Profile', icon: User },
    { id: 'company', label: 'Company & Tax Settings', icon: Building },
    { id: 'notifications', label: 'Alert Preferences', icon: Bell },
    { id: 'security', label: 'Security & RBAC Matrix', icon: Shield }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span>Administration</span>
          <span>/</span>
          <span className="text-blue-600">Settings</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
          System Configuration & Preferences
        </h1>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'profile' && (
        <Card title="User Profile Information" subtitle="Update personal contact information and operational department">
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={user?.name}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-500/20"
              />
              <div>
                <h4 className="font-bold text-slate-900">{profileForm.name}</h4>
                <p className="text-xs text-slate-500">{user?.role || 'Admin'} • {user?.department || 'Operations'}</p>
                <div className="mt-1 text-[11px] text-blue-600 font-medium">Avatar synced via Google Cloud Storage</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                required
              />
              <Input
                label="Email Address"
                value={profileForm.email}
                disabled
                helperText="Email is locked to unique identity."
              />
              <Input
                label="Phone Number"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              />
              <Input
                label="Department"
                value={profileForm.department}
                onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" size="md" icon={Save} loading={loading}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      )}

      {activeTab === 'company' && (
        <Card title="Corporate Identity & GST Details" subtitle="Invoicing entity details stamped on generated PDF tax invoices">
          <form onSubmit={handleCompanySave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Company Legal Name"
                value={companyForm.companyName}
                onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                required
              />
              <Input
                label="GSTIN / Corporate Tax ID"
                value={companyForm.gstin}
                onChange={(e) => setCompanyForm({ ...companyForm, gstin: e.target.value })}
                required
              />
              <Input
                label="Corporate Identity Number (CIN)"
                value={companyForm.cin}
                onChange={(e) => setCompanyForm({ ...companyForm, cin: e.target.value })}
              />
              <Input
                label="Base Currency"
                value={companyForm.currency}
                disabled
              />
              <div className="sm:col-span-2">
                <Input
                  label="Registered Corporate Address"
                  value={companyForm.address}
                  onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" size="md" icon={Save}>
                Save Company Details
              </Button>
            </div>
          </form>
        </Card>
      )}

      {activeTab === 'notifications' && (
        <Card title="Automated Event Triggers & Alerts" subtitle="Configure which system events trigger high-priority alerts">
          <div className="space-y-4 text-xs divide-y divide-slate-100">
            <div className="flex items-center justify-between pt-3">
              <div>
                <h5 className="font-bold text-slate-800">Low Stock Safety Alerts</h5>
                <p className="text-slate-500">Notify immediately when any SKU at any warehouse drops below threshold</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500" />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <h5 className="font-bold text-slate-800">Purchase Order Status Updates</h5>
                <p className="text-slate-500">Alert managers when POs are approved or goods are received</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500" />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <h5 className="font-bold text-slate-800">Payment Settlements</h5>
                <p className="text-slate-500">Send notification when customer invoices are marked paid</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500" />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <h5 className="font-bold text-slate-800">Inter-Warehouse Stock Balancing</h5>
                <p className="text-slate-500">Broadcast notification to source and destination warehouse managers upon transfer</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500" />
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'security' && (
        <Card title="Role-Based Access Control (RBAC) Matrix" subtitle="Detailed security permission mapping across application modules">
          <div className="border border-slate-200 rounded-lg overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <th className="py-2.5 px-3">Module / Capability</th>
                  <th className="py-2.5 px-3 text-center">Admin</th>
                  <th className="py-2.5 px-3 text-center">Inventory Mgr</th>
                  <th className="py-2.5 px-3 text-center">Purchase Mgr</th>
                  <th className="py-2.5 px-3 text-center">Sales Mgr</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { name: 'Products & Warehouses', a: true, i: true, p: false, s: false },
                  { name: 'Inter-Warehouse Transfers', a: true, i: true, p: false, s: false },
                  { name: 'Suppliers Directory', a: true, i: false, p: true, s: false },
                  { name: 'Purchase Order Approval', a: true, i: false, p: false, s: false },
                  { name: 'Goods Receiving Inspection', a: true, i: true, p: true, s: false },
                  { name: 'Customers & Sales Orders', a: true, i: false, p: false, s: true },
                  { name: 'Invoices & Payment Recording', a: true, i: false, p: false, s: true },
                  { name: 'Executive Analytics & Reports', a: true, i: true, p: true, s: true },
                  { name: 'User Role Management', a: true, i: false, p: false, s: false },
                  { name: 'Full Immutable Audit Logs', a: true, i: false, p: false, s: false }
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{row.name}</td>
                    <td className="py-2.5 px-3 text-center">{row.a ? '✅' : '❌'}</td>
                    <td className="py-2.5 px-3 text-center">{row.i ? '✅' : '❌'}</td>
                    <td className="py-2.5 px-3 text-center">{row.p ? '✅' : '❌'}</td>
                    <td className="py-2.5 px-3 text-center">{row.s ? '✅' : '❌'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
