const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  location: { type: String, required: true },
  address: { type: String, default: '' },
  manager: { type: String, default: 'Warehouse Manager' },
  contactPhone: { type: String, default: '' },
  capacityUnits: { type: Number, default: 50000 },
  status: { type: String, enum: ['Active', 'Maintenance', 'Inactive'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Warehouse', warehouseSchema);
