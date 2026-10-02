import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Select } from '../../components/common/Select';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';
import axiosClient from '../../api/axiosClient';
import { ArrowRight, ArrowLeftRight, CheckCircle2 } from 'lucide-react';

export const StockTransferModal = ({ isOpen, onClose, onSuccess, initialFromWhId, initialProductId }) => {
  const { addToast } = useToast();
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [fromWarehouseId, setFromWarehouseId] = useState(initialFromWhId || '');
  const [toWarehouseId, setToWarehouseId] = useState('');
  const [productId, setProductId] = useState(initialProductId || '');
  const [quantity, setQuantity] = useState('20');
  const [reason, setReason] = useState('Stock balancing for Western Maharashtra demand');

  const [availableStock, setAvailableStock] = useState(0);

  // Load warehouses & products
  useEffect(() => {
    const loadData = async () => {
      try {
        setFetching(true);
        const [whRes, prodRes] = await Promise.all([
          axiosClient.get('/warehouses'),
          axiosClient.get('/products')
        ]);

        if (whRes.success) {
          setWarehouses(whRes.warehouses || []);
          if (!fromWarehouseId && whRes.warehouses.length > 0) {
            setFromWarehouseId(whRes.warehouses[0]._id);
          }
          if (!toWarehouseId && whRes.warehouses.length > 1) {
            setToWarehouseId(whRes.warehouses[1]._id);
          }
        }

        if (prodRes.success) {
          setProducts(prodRes.products || []);
          if (!productId && prodRes.products.length > 0) {
            setProductId(prodRes.products[0]._id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };

    if (isOpen) loadData();
  }, [isOpen]);

  // Recalculate available stock when fromWarehouse or product changes
  useEffect(() => {
    if (!productId || !fromWarehouseId || products.length === 0) return;
    const selectedProd = products.find(p => p._id === productId);
    if (selectedProd && selectedProd.warehouseStock) {
      const whItem = selectedProd.warehouseStock.find(w => w.warehouseId === fromWarehouseId);
      setAvailableStock(whItem ? (whItem.quantity - (whItem.reservedQuantity || 0)) : 0);
    }
  }, [productId, fromWarehouseId, products]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const qty = Number(quantity);

    if (fromWarehouseId === toWarehouseId) {
      addToast({ title: 'Invalid destination', message: 'Source and Destination warehouses cannot be identical', type: 'error' });
      return;
    }

    if (!qty || qty <= 0) {
      addToast({ title: 'Invalid quantity', message: 'Please enter a valid quantity greater than 0', type: 'warning' });
      return;
    }

    if (qty > availableStock) {
      addToast({
        title: 'Insufficient Stock',
        message: `Only ${availableStock} units available at source warehouse. Cannot transfer ${qty}.`,
        type: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      const res = await axiosClient.post('/inventory/transfer', {
        fromWarehouseId,
        toWarehouseId,
        productId,
        quantity: qty,
        reason
      });

      if (res.success) {
        addToast({
          title: 'Transfer Completed!',
          message: `${qty} units transferred successfully (#${res.transferCode})`,
          type: 'success'
        });
        onSuccess();
      }
    } catch (err) {
      addToast({ title: 'Transfer Failed', message: err.message || 'Error executing transfer', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fromWhName = warehouses.find(w => w._id === fromWarehouseId)?.name || 'Source';
  const toWhName = warehouses.find(w => w._id === toWarehouseId)?.name || 'Destination';
  const prodName = products.find(p => p._id === productId)?.name || 'Product';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Inter-Warehouse Stock Transfer"
      subtitle="Safely balance inventory across regional storage hubs with atomic execution"
      maxWidth="max-w-xl"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={ArrowLeftRight}
            loading={loading}
            onClick={handleSubmit}
          >
            Transfer Stock
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Source Warehouse */}
        <Select
          label="From Warehouse (Source)"
          value={fromWarehouseId}
          onChange={(e) => setFromWarehouseId(e.target.value)}
          options={warehouses.map(w => ({ value: w._id, label: `${w.name} (${w.location})` }))}
          required
        />

        {/* Destination Warehouse */}
        <Select
          label="To Warehouse (Destination)"
          value={toWarehouseId}
          onChange={(e) => setToWarehouseId(e.target.value)}
          options={warehouses.map(w => ({ value: w._id, label: `${w.name} (${w.location})` }))}
          required
        />

        {/* Product Selection */}
        <Select
          label="Product"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          options={products.map(p => ({ value: p._id, label: `${p.name} [SKU: ${p.sku}]` }))}
          required
        />

        {/* Real-time Available Stock Callout */}
        <div className="p-3 bg-blue-50 border border-blue-200/80 rounded-xl flex items-center justify-between text-xs">
          <div>
            <span className="font-semibold text-blue-900">Available Stock in {fromWhName}:</span>
            <div className="text-[11px] text-blue-700">Real-time inventory ready for dispatch</div>
          </div>
          <span className="text-xl font-extrabold text-blue-900 bg-white px-3 py-1 rounded-lg border border-blue-200">
            {availableStock} units
          </span>
        </div>

        {/* Quantity */}
        <Input
          label="Transfer Quantity"
          type="number"
          min="1"
          max={availableStock}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="e.g. 20"
          required
        />

        {/* Reason */}
        <Input
          label="Transfer Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Stock balancing for upcoming regional orders"
        />

        {/* Dynamic Visual Flow Preview */}
        <div className="mt-4 p-4 rounded-xl bg-slate-900 text-white text-xs">
          <div className="font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-2">
            Atomic State Simulation
          </div>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-slate-400 text-[10px]">{fromWhName}</div>
              <div className="text-sm font-bold text-rose-400 mt-0.5">
                {availableStock} → {Math.max(0, availableStock - (Number(quantity) || 0))} units
              </div>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-blue-400 bg-slate-800 px-2 py-0.5 rounded-full mb-1">
                {quantity || 0} units
              </span>
              <ArrowRight className="w-5 h-5 text-blue-400" />
            </div>

            <div className="text-center">
              <div className="text-slate-400 text-[10px]">{toWhName}</div>
              <div className="text-sm font-bold text-emerald-400 mt-0.5">
                Increases by +{quantity || 0}
              </div>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};
