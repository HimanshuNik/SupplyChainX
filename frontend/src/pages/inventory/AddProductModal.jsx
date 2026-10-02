import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';
import axiosClient from '../../api/axiosClient';

export const AddProductModal = ({ isOpen, onClose, onSuccess, warehouses = [] }) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: 'Electronics',
    description: '',
    unit: 'pcs',
    purchasePrice: '',
    sellingPrice: '',
    taxRate: '18',
    warehouseId: warehouses[0]?._id || '',
    initialQuantity: '20',
    minStockLevel: '10',
    maxStockLevel: '300',
    preferredSupplier: 'ABC Technologies Ltd'
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.sku || !form.purchasePrice || !form.sellingPrice) {
      addToast({ title: 'Validation', message: 'Please fill in required product fields', type: 'warning' });
      return;
    }

    try {
      setLoading(true);
      const res = await axiosClient.post('/products', form);
      if (res.success) {
        addToast({ title: 'Success', message: `Product ${form.sku} added with initial stock!`, type: 'success' });
        onSuccess();
      }
    } catch (err) {
      addToast({ title: 'Error', message: err.message || 'Failed to create product', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Product"
      subtitle="Define basic information, commercial pricing, and warehouse stock allocation"
      maxWidth="max-w-2xl"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="md" loading={loading} onClick={handleSubmit}>
            Create Product
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3 pb-1 border-b border-slate-100">
            1. Basic Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Product Name"
              name="name"
              placeholder="e.g. Mechanical Ergonomic Keyboard"
              value={form.name}
              onChange={handleChange}
              required
            />
            <Input
              label="SKU"
              name="sku"
              placeholder="e.g. P-1009"
              value={form.sku}
              onChange={handleChange}
              required
            />
            <Select
              label="Category"
              name="category"
              value={form.category}
              onChange={handleChange}
              options={['Electronics', 'Peripherals', 'Networking', 'Industrial', 'Accessories']}
              required
            />
            <Input
              label="Unit of Measure"
              name="unit"
              placeholder="pcs, boxes, kg"
              value={form.unit}
              onChange={handleChange}
            />
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                name="description"
                rows={2}
                value={form.description}
                onChange={handleChange}
                placeholder="Product technical details and specifications..."
                className="w-full text-xs rounded-lg border border-slate-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Pricing */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3 pb-1 border-b border-slate-100">
            2. Commercial Pricing & Tax
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Purchase Price (₹)"
              name="purchasePrice"
              type="number"
              placeholder="800"
              value={form.purchasePrice}
              onChange={handleChange}
              required
            />
            <Input
              label="Selling Price (₹)"
              name="sellingPrice"
              type="number"
              placeholder="1500"
              value={form.sellingPrice}
              onChange={handleChange}
              required
            />
            <Input
              label="GST / Tax Rate (%)"
              name="taxRate"
              type="number"
              placeholder="18"
              value={form.taxRate}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Section 3: Inventory Allocation */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3 pb-1 border-b border-slate-100">
            3. Inventory & Safe Stock Thresholds
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Initial Warehouse"
              name="warehouseId"
              value={form.warehouseId}
              onChange={handleChange}
              options={warehouses.map(w => ({ value: w._id, label: `${w.name} (${w.location})` }))}
              required
            />
            <Input
              label="Initial Quantity"
              name="initialQuantity"
              type="number"
              placeholder="20"
              value={form.initialQuantity}
              onChange={handleChange}
              required
            />
            <Input
              label="Minimum Stock (Alert Threshold)"
              name="minStockLevel"
              type="number"
              placeholder="10"
              value={form.minStockLevel}
              onChange={handleChange}
            />
            <Input
              label="Maximum Stock Capacity"
              name="maxStockLevel"
              type="number"
              placeholder="300"
              value={form.maxStockLevel}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Section 4: Supplier */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3 pb-1 border-b border-slate-100">
            4. Supplier Assignment
          </h4>
          <Select
            label="Preferred Supplier"
            name="preferredSupplier"
            value={form.preferredSupplier}
            onChange={handleChange}
            options={[
              'ABC Technologies Ltd',
              'XYZ Components Corp',
              'Apex Hardware Distributors'
            ]}
          />
        </div>
      </form>
    </Modal>
  );
};
