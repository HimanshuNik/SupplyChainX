const mongoose = require('mongoose');

const paymentRecordSchema = new mongoose.Schema({
  paymentId: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  method: { 
    type: String, 
    enum: ['UPI', 'Bank Transfer', 'Credit Card', 'Cash', 'Cheque'],
    default: 'UPI' 
  },
  reference: { type: String, default: '' },
  recordedBy: { type: String, default: 'Finance' }
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true, uppercase: true },
  salesOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'SalesOrder' },
  salesOrderNumber: { type: String, required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, default: '' },
  customerAddress: { type: String, default: '' },
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date },
  items: [{
    productName: String,
    sku: String,
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number
  }],
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  balanceAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Partial', 'Paid', 'Overdue', 'Cancelled'],
    default: 'Pending'
  },
  payments: [paymentRecordSchema]
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
