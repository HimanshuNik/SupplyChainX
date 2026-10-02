const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  module: { 
    type: String, 
    enum: ['INVENTORY', 'PROCUREMENT', 'SALES', 'AUTH', 'SETTINGS', 'WAREHOUSE'],
    required: true 
  },
  user: { type: String, required: true },
  role: { type: String, default: 'Staff' },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  ipAddress: { type: String, default: '127.0.0.1' },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
