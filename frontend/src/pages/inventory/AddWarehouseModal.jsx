import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';
import axiosClient from '../../api/axiosClient';

export const AddWarehouseModal = ({ isOpen, onClose, onSuccess }) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    code: '',
    location: '',
    address: '',
    manager: '',
    contactPhone: '',
    capacityUnits: '50000'
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.code || !form.location) {
      addToast({ title: 'Validation', message: 'Name, code, and location are required', type: 'warning' });
      return;
    }

    try {
      setLoading(true);
      const res = await axiosClient.post('/warehouses', form);
      if (res.success) {
        addToast({ title: 'Warehouse Created', message: `${form.name} added successfully!`, type: 'success' });
        onSuccess();
      }
    } catch (err) {
      addToast({ title: 'Error', message: err.message || 'Failed to create warehouse', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Warehouse"
      subtitle="Register a new regional storage hub or fulfillment center"
      maxWidth="max-w-lg"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="md" loading={loading} onClick={handleSubmit}>
            Create Warehouse
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Warehouse Name"
          name="name"
          placeholder="e.g. Nashik Regional Logistics Hub"
          value={form.name}
          onChange={handleChange}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Warehouse Code"
            name="code"
            placeholder="e.g. WH-NSK-04"
            value={form.code}
            onChange={handleChange}
            required
          />
          <Input
            label="Location / City"
            name="location"
            placeholder="e.g. Nashik, Maharashtra"
            value={form.location}
            onChange={handleChange}
            required
          />
        </div>

        <Input
          label="Full Physical Address"
          name="address"
          placeholder="Plot number, industrial zone, road..."
          value={form.address}
          onChange={handleChange}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Warehouse Manager"
            name="manager"
            placeholder="Manager name"
            value={form.manager}
            onChange={handleChange}
          />
          <Input
            label="Contact Phone"
            name="contactPhone"
            placeholder="+91 253 2223344"
            value={form.contactPhone}
            onChange={handleChange}
          />
        </div>

        <Input
          label="Total Storage Capacity (Units)"
          name="capacityUnits"
          type="number"
          placeholder="50000"
          value={form.capacityUnits}
          onChange={handleChange}
        />
      </form>
    </Modal>
  );
};
