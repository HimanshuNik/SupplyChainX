import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Select } from '../../components/common/Select';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';
import { formatCurrency } from '../../utils/formatters';
import axiosClient from '../../api/axiosClient';
import { Plus, Trash2, ShieldCheck } from 'lucide-react';

export const CreatePOModal = ({ isOpen, onClose, onSuccess, suppliers = [], warehouses = [] }) => {
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [supplierId, setSupplierId] = useState(suppliers[0]?._id || '');
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?._id || '');
  const [notes, setNotes] = useState('Stock replenishment order for Central Hub.');
  
  const [items, setItems] = useState([
    { productId: '', orderQty: 50, unitPrice: 0 }
  ]);

  // Load products list
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await axiosClient.get('/products');
        if (res.success && res.products.length > 0) {
          setProducts(res.products);
          setItems([{
            productId: res.products[0]._id,
            orderQty: 50,
            unitPrice: res.products[0].purchasePrice || 800
          }]);
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (isOpen) loadProducts();
  }, [isOpen]);

  const handleProductChange = (idx, prodId) => {
    const prod = products.find(p => p._id === prodId);
    const updated = [...items];
    updated[idx] = {
      ...updated[idx],
      productId: prodId,
      unitPrice: prod ? prod.purchasePrice : 0
    };
    setItems(updated);
  };

  const handleQtyChange = (idx, qty) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], orderQty: Number(qty) || 1 };
    setItems(updated);
  };

  const handlePriceChange = (idx, price) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], unitPrice: Number(price) || 0 };
    setItems(updated);
  };

  const addItemRow = () => {
    if (products.length === 0) return;
    setItems(prev => [
      ...prev,
      { productId: products[0]._id, orderQty: 25, unitPrice: products[0].purchasePrice || 400 }
    ]);
  };

  const removeItemRow = (idx) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  // Calculations
  const subtotal = items.reduce((acc, curr) => acc + (curr.orderQty * curr.unitPrice), 0);
  const tax = Math.round(subtotal * 0.18);
  const totalAmount = subtotal + tax;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supplierId || !warehouseId || items.length === 0) {
      addToast({ title: 'Validation', message: 'Supplier, warehouse, and items are required', type: 'warning' });
      return;
    }

    try {
      setLoading(true);
      const res = await axiosClient.post('/purchase-orders', {
        supplierId,
        warehouseId,
        items,
        notes
      });

      if (res.success) {
        addToast({
          title: 'PO Created',
          message: `Purchase Order ${res.order.poNumber} created and submitted for approval!`,
          type: 'success'
        });
        onSuccess();
      }
    } catch (err) {
      addToast({ title: 'Error', message: err.message || 'Failed to create PO', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Purchase Order"
      subtitle="Issue procurement requisition for inventory replenishment"
      maxWidth="max-w-3xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-primary-600" />
            <span>Workflow: Draft → Admin Approval → Goods Receiving</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={loading}
              onClick={handleSubmit}
            >
              Submit for Approval
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Supplier"
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            options={suppliers.map(s => ({ value: s._id, label: `${s.name} (${s.code})` }))}
            required
          />

          <Select
            label="Destination Warehouse"
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            options={warehouses.map(w => ({ value: w._id, label: `${w.name} (${w.location})` }))}
            required
          />
        </div>

        {/* Product Items Table */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Procurement Line Items
            </h4>
            <Button variant="ghost" size="sm" icon={Plus} onClick={addItemRow} className="text-primary-600">
              Add Product
            </Button>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-x-auto bg-white">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3 w-28">Order Qty</th>
                  <th className="py-2.5 px-3 w-32">Unit Price (₹)</th>
                  <th className="py-2.5 px-3 w-32 text-right">Line Total</th>
                  <th className="py-2.5 px-2 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-2">
                      <select
                        value={item.productId}
                        onChange={(e) => handleProductChange(idx, e.target.value)}
                        className="w-full rounded border border-slate-200 p-1.5 text-xs text-slate-900 bg-white"
                      >
                        {products.map(p => (
                          <option key={p._id} value={p._id}>
                            {p.name} ({p.sku})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min="1"
                        value={item.orderQty}
                        onChange={(e) => handleQtyChange(idx, e.target.value)}
                        className="w-full rounded border border-slate-200 p-1.5 text-xs text-slate-900 text-center"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => handlePriceChange(idx, e.target.value)}
                        className="w-full rounded border border-slate-200 p-1.5 text-xs text-slate-900 text-right"
                      />
                    </td>
                    <td className="p-2 text-right font-bold text-slate-900">
                      {formatCurrency(item.orderQty * item.unitPrice)}
                    </td>
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeItemRow(idx)}
                        disabled={items.length === 1}
                        className="text-slate-400 hover:text-rose-600 disabled:opacity-20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="flex justify-end pt-2">
          <div className="w-64 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST / Tax (18%):</span>
              <span className="font-semibold text-slate-900">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Amount:</span>
              <span className="text-blue-600 font-extrabold">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>

        <Input
          label="Internal Notes / Requisition Justification"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Q3 replenishment order"
        />
      </form>
    </Modal>
  );
};
