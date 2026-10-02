const mongoose = require('mongoose');

const poItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  sku: { type: String, required: true },
  orderQty: { type: Number, required: true, min: 1 },
  receivedQty: { type: Number, default: 0, min: 0 },
  unitPrice: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 }
});

const purchaseOrderSchema = new mongoose.Schema({
  poNumber: { type: String, required: true, unique: true, uppercase: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  supplierName: { type: String, required: true },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  warehouseName: { type: String, required: true },
  orderDate: { type: Date, default: Date.now },
  expectedDate: { type: Date },
  items: [poItemSchema],
  subtotal: { type: Number, required: true, min: 0 },
  tax: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Ordered', 'Partially Received', 'Received', 'Cancelled'],
    default: 'Pending'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Partial', 'Paid'],
    default: 'Pending'
  },
  notes: { type: String, default: '' },
  createdBy: { type: String, default: 'Purchase Manager' },
  approvedBy: { type: String, default: '' },
  approvedAt: { type: Date },
  receivedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
