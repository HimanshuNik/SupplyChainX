const mongoose = require('mongoose');

const stockTransactionSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['IN', 'OUT', 'TRANSFER', 'ADJUSTMENT'], 
    required: true 
  },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  sku: { type: String, required: true },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  warehouseName: { type: String, required: true },
  toWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  toWarehouseName: { type: String },
  quantity: { type: Number, required: true },
  previousQuantity: { type: Number, required: true },
  newQuantity: { type: Number, required: true },
  referenceType: { 
    type: String, 
    enum: ['PURCHASE_ORDER', 'SALES_ORDER', 'TRANSFER', 'MANUAL_ADJUSTMENT', 'INITIAL_STOCK'],
    default: 'MANUAL_ADJUSTMENT'
  },
  referenceId: { type: String, default: '' },
  reason: { type: String, default: '' },
  performedBy: { type: String, default: 'Admin' }
}, { timestamps: true });

module.exports = mongoose.model('StockTransaction', stockTransactionSchema);
