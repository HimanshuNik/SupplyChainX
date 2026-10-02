const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
  category: { type: String, required: true },
  description: { type: String, default: '' },
  unit: { type: String, default: 'pcs' },
  purchasePrice: { type: Number, required: true, min: 0 },
  sellingPrice: { type: Number, required: true, min: 0 },
  taxRate: { type: Number, default: 18 }, // GST %
  minStockLevel: { type: Number, default: 10 },
  maxStockLevel: { type: Number, default: 500 },
  preferredSupplier: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'Archived'], default: 'Active' },
  image: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
