import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Select } from '../../components/common/Select';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';
import { formatCurrency } from '../../utils/formatters';
import axiosClient from '../../api/axiosClient';
import { Plus, Trash2, AlertCircle, ShoppingCart, CheckCircle2 } from 'lucide-react';

export const CreateSalesOrderModal = ({ isOpen, onClose, onSuccess, customers = [], warehouses = [] }) => {
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [customerId, setCustomerId] = useState(customers[0]?._id || '');
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?._id || '');
  const [discount, setDiscount] = useState('500');
  const [notes, setNotes] = useState('Standard delivery dispatch.');

  const [items, setItems] = useState([
    { productId: '', quantity: 5, unitPrice: 0, available: 0 }
  ]);

  // Load products list with warehouse stock
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await axiosClient.get('/products');
        if (res.success && res.products.length > 0) {
          setProducts(res.products);
          
          const defaultProd = res.products[0];
          const stock = getAvailableStock(defaultProd, warehouseId);

          setItems([{
            productId: defaultProd._id,
            quantity: 5,
            unitPrice: defaultProd.sellingPrice || 1500,
            available: stock
          }]);
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (isOpen) loadProducts();
  }, [isOpen, warehouseId]);

  const getAvailableStock = (prod, whId) => {
    if (!prod || !prod.warehouseStock) return 0;
    const whStock = prod.warehouseStock.find(w => w.warehouseId === whId);
    return whStock ? Math.max(0, whStock.quantity - (whStock.reservedQuantity || 0)) : 0;
  };

  const handleProductChange = (idx, prodId) => {
    const prod = products.find(p => p._id === prodId);
    const available = getAvailableStock(prod, warehouseId);

    const updated = [...items];
    updated[idx] = {
      ...updated[idx],
      productId: prodId,
      unitPrice: prod ? prod.sellingPrice : 0,
      available
    };
    setItems(updated);
  };

  const handleQtyChange = (idx, qty) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], quantity: Number(qty) || 1 };
    setItems(updated);
  };

  const handlePriceChange = (idx, price) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], unitPrice: Number(price) || 0 };
    setItems(updated);
  };

  const addItemRow = () => {
    if (products.length === 0) return;
    const nextProd = products[items.length % products.length] || products[0];
    const available = getAvailableStock(nextProd, warehouseId);

    setItems(prev => [
      ...prev,
      { productId: nextProd._id, quantity: 2, unitPrice: nextProd.sellingPrice || 850, available }
    ]);
  };

  const removeItemRow = (idx) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  // Calculations
  const subtotal = items.reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0);
  const disc = Number(discount) || 0;
  const taxableAmount = Math.max(0, subtotal - disc);
  const tax = Math.round(taxableAmount * 0.18);
  const totalAmount = taxableAmount + tax;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerId || !warehouseId || items.length === 0) {
      addToast({ title: 'Validation', message: 'Customer, warehouse, and items are required', type: 'warning' });
      return;
    }

    // Client-side pre-validation
    for (const it of items) {
      const prod = products.find(p => p._id === it.productId);
      const prodName = prod?.name || 'Item';
      if (it.quantity > it.available) {
        addToast({
          title: 'Stock Exceeded!',
          message: `Cannot order ${it.quantity} units of "${prodName}". Only ${it.available} units available in selected warehouse.`,
          type: 'error'
        });
        return;
      }
    }

    try {
      setLoading(true);
      const res = await axiosClient.post('/sales-orders', {
        customerId,
        warehouseId,
        items,
        discount: disc,
        notes
      });

      if (res.success) {
        addToast({
          title: 'Order Confirmed!',
          message: `Sales Order ${res.order.orderNumber} confirmed. Stock deducted and Invoice ${res.invoice.invoiceNumber} generated!`,
          type: 'success'
        });
        onSuccess(res.order, res.invoice);
      }
    } catch (err) {
      addToast({ title: 'Order Rejected', message: err.message || 'Error processing sales order', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Sales Order"
      subtitle="Dispatch goods with real-time stock validation & automatic invoice generation"
      maxWidth="max-w-3xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Stock auto-deducts & invoice spawns instantly</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={loading}
              icon={ShoppingCart}
              onClick={handleSubmit}
            >
              Create Order
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Customer"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            options={customers.map(c => ({ value: c._id, label: `${c.name} (${c.company || 'Retail'})` }))}
            required
          />

          <Select
            label="Dispatch Warehouse (Source of Stock)"
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            options={warehouses.map(w => ({ value: w._id, label: `${w.name} (${w.location})` }))}
            required
          />
        </div>

        {/* Product Items Table with Available Stock Counter */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Ordered Products
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
                  <th className="py-2.5 px-3 text-center w-24">Available</th>
                  <th className="py-2.5 px-3 text-center w-24">Qty</th>
                  <th className="py-2.5 px-3 text-right w-28">Price (₹)</th>
                  <th className="py-2.5 px-3 text-right w-28">Total</th>
                  <th className="py-2.5 px-2 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => {
                  const isInsufficient = item.quantity > item.available;

                  return (
                    <tr key={idx} className={isInsufficient ? 'bg-rose-50/50' : ''}>
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
                      <td className="p-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          item.available > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {item.available} units
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          min="1"
                          max={item.available || 1}
                          value={item.quantity}
                          onChange={(e) => handleQtyChange(idx, e.target.value)}
                          className={`w-20 rounded border p-1.5 text-xs text-center font-bold ${
                            isInsufficient ? 'border-rose-400 bg-rose-50 text-rose-900' : 'border-slate-200 text-slate-900'
                          }`}
                        />
                      </td>
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => handlePriceChange(idx, e.target.value)}
                          className="w-24 rounded border border-slate-200 p-1.5 text-xs text-slate-900 text-right font-mono"
                        />
                      </td>
                      <td className="p-2 text-right font-bold text-slate-900 font-mono">
                        {formatCurrency(item.quantity * item.unitPrice)}
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Totals Breakdown */}
        <div className="flex justify-end pt-2">
          <div className="w-72 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900 font-mono">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Discount (₹):</span>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-24 border border-slate-200 rounded px-2 py-0.5 text-right font-mono text-xs"
              />
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST / Tax (18%):</span>
              <span className="font-semibold text-slate-900 font-mono">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Payable:</span>
              <span className="text-blue-600 font-extrabold font-mono">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>

        <Input
          label="Dispatch & Delivery Instructions"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Courier express dispatch via BlueDart"
        />
      </form>
    </Modal>
  );
};
