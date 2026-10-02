import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, Mail, Lock, User, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';

export const RegisterPage = () => {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'Inventory Manager'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      addToast({ title: 'Missing fields', message: 'Please complete required fields', type: 'warning' });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      addToast({ title: 'Password mismatch', message: 'Passwords do not match', type: 'error' });
      return;
    }

    setLoading(true);
    const res = await register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: formData.role
    });
    setLoading(false);

    if (res.success) {
      addToast({ title: 'Account created!', message: 'Welcome to SupplyChainX', type: 'success' });
      navigate('/dashboard');
    } else {
      addToast({ title: 'Registration failed', message: res.message || 'Error creating account', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-2xl text-slate-900 tracking-tight">
            SupplyChain<span className="text-blue-600">X</span>
          </span>
        </Link>
        <h2 className="mt-6 text-2xl font-extrabold text-slate-900 tracking-tight">
          Create an Enterprise Account
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Join your organization's multi-warehouse logistics network
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-200/80">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <Input
              label="Full Name"
              name="name"
              icon={User}
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Ramesh Kumar"
              required
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              placeholder="ramesh@company.com"
              required
            />

            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              icon={Phone}
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 00000"
            />

            {/* Role Selection: Notice Admin is excluded for production-level security as required! */}
            <div>
              <Select
                label="Operational Role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                options={[
                  { value: 'Inventory Manager', label: 'Inventory Manager (Warehousing & Transfers)' },
                  { value: 'Purchase Manager', label: 'Purchase Manager (Suppliers & Goods Receiving)' },
                  { value: 'Sales Manager', label: 'Sales Manager (Customers & Invoices)' }
                ]}
                helperText="Admin roles are assigned strictly through the central administrative console."
                required
              />
            </div>

            <Input
              label="Password"
              name="password"
              type="password"
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
              placeholder="•••••••••"
              required
            />

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              icon={Lock}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="•••••••••"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              icon={ArrowRight}
              iconPosition="right"
              className="w-full mt-2"
            >
              Complete Registration
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-blue-600 hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
