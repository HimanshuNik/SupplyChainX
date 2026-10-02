const { dbStore } = require('../utils/dbStore');

// @desc    Get audit trail logs
// @route   GET /api/audit-logs
// @access  Private (Admin)
const getAuditLogs = async (req, res) => {
  try {
    const { module, user, search } = req.query;
    let logs = dbStore.collection('auditLogs').find().sort({ timestamp: -1 });

    if (module && module !== 'All') {
      logs = logs.filter(l => l.module === module);
    }
    if (user && user !== 'All') {
      logs = logs.filter(l => l.user === user);
    }
    if (search) {
      const q = search.toLowerCase();
      logs = logs.filter(l =>
        l.action.toLowerCase().includes(q) ||
        l.user.toLowerCase().includes(q) ||
        (l.role && l.role.toLowerCase().includes(q))
      );
    }

    res.json({ success: true, count: logs.length, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching audit logs' });
  }
};

module.exports = {
  getAuditLogs
};
