const { dbStore } = require('./dbStore');
const AuditLog = require('../models/AuditLog');
const { getIsConnected } = require('../config/db');

const logAction = async ({ action, module, user, role = 'Staff', details = {}, ipAddress = '127.0.0.1' }) => {
  try {
    const entry = {
      action,
      module,
      user: typeof user === 'string' ? user : (user?.name || 'System'),
      role: typeof role === 'string' ? role : (user?.role || 'Staff'),
      details,
      ipAddress,
      timestamp: new Date().toISOString()
    };

    if (getIsConnected()) {
      await AuditLog.create(entry);
    } else {
      dbStore.collection('auditLogs').create(entry);
    }
  } catch (err) {
    console.error('AuditLog error:', err.message);
  }
};

module.exports = { logAction };
