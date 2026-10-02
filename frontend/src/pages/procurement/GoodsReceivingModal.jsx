import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';
import axiosClient from '../../api/axiosClient';
import { CheckCircle2, PackageCheck, AlertCircle, ArrowDownRight } from 'lucide-react';

export const GoodsReceivingModal = ({ purchaseOrder, isOpen, onClose, onSuccess }) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  // Initialize received quantities default to the remaining pending quantity
  const [receivedMap, setReceivedMap] = useState(() => {
    const initial = {};
    (purchaseOrder?.items || []).forEach(item => {
      initial[item.product] = Math.max(0, item.orderQty - (item.receivedQty || 0));
    });
    return initial;
  });

  if (!purchaseOrder) return null;

  const handleQtyChange = (productId, qty) => {
    setReceivedMap(prev => ({
      ...prev,
      [productId]: Math.max(0, Number(qty) || 0)
    }));
  };

  const handleConfirmReceipt = async () => {
    const receivedItems = Object.keys(receivedMap).map(prodId => ({
      productId: prodId,
      receivedQty: receivedMap[prodId]
    }));

    const totalToReceive = receivedItems.reduce((acc, curr) => acc + curr.receivedQty, 0);
    if (totalToReceive <= 0) {
      addToast({ title: 'Validation', message: 'Please specify at least 1 unit to receive', type: 'warning' });
      return;
    }

    try {
      setLoading(true);
      const res = await axiosClient.post(`/purchase-orders/${purchaseOrder._id}/receive`, {
        receivedItems
      });

      if (res.success) {
        addToast({
          title: 'Goods Received!',
          message: `Inventory in ${purchaseOrder.warehouseName} successfully updated!`,
          type: 'success'
        });
        onSuccess();
      }
    } catch (err) {
      addToast({ title: 'Receiving Failed', message: err.message || 'Error processing goods receipt', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Goods Receiving Inspection: ${purchaseOrder.poNumber}`}
      subtitle={`Receiving into: ${purchaseOrder.warehouseName} • Supplier: ${purchaseOrder.supplierName}`}
      maxWidth="max-w-2xl"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="success"
            size="md"
            icon={PackageCheck}
            loading={loading}
            onClick={handleConfirmReceipt}
          >
            Confirm Receipt & Update Inventory
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="p-3 bg-blue-50 border border-blue-200/80 rounded-xl text-xs text-blue-800 flex items-start gap-2.5">
          <PackageCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Automated Multi-Warehouse Intake:</span> Confirming this inspection will automatically increment the physical stock in <strong>{purchaseOrder.warehouseName}</strong>, record immutable stock transactions of type <code>IN</code>, and update analytics in real time.
          </div>
        </div>

        {/* Ordered vs Received Items Table */}
        <div className="border border-slate-200 rounded-lg overflow-x-auto bg-white">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3">SKU</th>
                <th className="py-2.5 px-3 text-center">Ordered</th>
                <th className="py-2.5 px-3 text-center">Already Received</th>
                <th className="py-2.5 px-3 text-center w-36">Now Receiving</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(purchaseOrder.items || []).map((item, idx) => {
                const remaining = item.orderQty - (item.receivedQty || 0);
                const currentInput = receivedMap[item.product] !== undefined ? receivedMap[item.product] : remaining;

                return (
                  <tr key={idx} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{item.productName}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{item.sku}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-800">{item.orderQty}</td>
                    <td className="py-2.5 px-3 text-center text-slate-500">{item.receivedQty || 0}</td>
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max={remaining}
                        value={currentInput}
                        onChange={(e) => handleQtyChange(item.product, e.target.value)}
                        className="w-24 text-center rounded-lg border border-slate-300 font-bold text-slate-900 p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
};
