const mongoose = require('mongoose');

const soItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  sku: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 }
});

const salesOrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true, uppercase: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  customerName: { type: String, required: true },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  warehouseName: { type: String, required: true },
  orderDate: { type: Date, default: Date.now },
  items: [soItemSchema],
  subtotal: { type: Number, required: true, min: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  status: { 
    type: String, 
    enum: ['Draft', 'Confirmed', 'Processing', 'Dispatched', 'Completed', 'Cancelled'],
    default: 'Confirmed'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Partial', 'Paid', 'Overdue'],
    default: 'Pending'
  },
  notes: { type: String, default: '' },
  createdBy: { type: String, default: 'Sales Manager' },
  invoiceGenerated: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('SalesOrder', salesOrderSchema);
