const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  email: { type: String, required: true, trim: true },
  phone: { type: String, required: true },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  contactPerson: { type: String, default: '' },
  paymentTerms: { type: String, default: 'Net 30' },
  rating: { type: Number, default: 4.5, min: 1, max: 5 },
  categories: [{ type: String }],
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  outstandingPayable: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);
