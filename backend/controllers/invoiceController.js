const { dbStore } = require('../utils/dbStore');
const { logAction } = require('../utils/auditLogger');

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private
const getInvoices = async (req, res) => {
  try {
    const { status, customerId, search } = req.query;
    let invoices = dbStore.collection('invoices').find().sort({ createdAt: -1 });

    if (status && status !== 'All') {
      invoices = invoices.filter(inv => inv.status === status);
    }
    if (customerId && customerId !== 'All') {
      invoices = invoices.filter(inv => inv.customer === customerId);
    }
    if (search) {
      const q = search.toLowerCase();
      invoices = invoices.filter(inv =>
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.customerName.toLowerCase().includes(q) ||
        inv.salesOrderNumber.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, count: invoices.length, invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching invoices' });
  }
};

// @desc    Get single invoice
// @route   GET /api/invoices/:id
// @access  Private
const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const inv = dbStore.collection('invoices').findById(id) || dbStore.collection('invoices').findOne({ invoiceNumber: id });

    if (!inv) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.json({ success: true, invoice: inv });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching invoice' });
  }
};

// @desc    Record payment for invoice
// @route   POST /api/invoices/:id/payments
// @access  Private (Admin, Sales Manager)
const recordPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, method = 'UPI', reference = '', notes = '' } = req.body;

    const paymentAmount = Number(amount);
    if (!paymentAmount || paymentAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid payment amount > 0' });
    }

    const inv = dbStore.collection('invoices').findById(id) || dbStore.collection('invoices').findOne({ invoiceNumber: id });
    if (!inv) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    if (inv.status === 'Paid') {
      return res.status(400).json({ success: false, message: 'Invoice is already fully paid' });
    }

    const currentPaid = Number(inv.paidAmount) || 0;
    const newPaid = currentPaid + paymentAmount;
    const newBalance = Math.max(0, inv.totalAmount - newPaid);

    let newStatus = 'Partial';
    if (newBalance === 0 || newPaid >= inv.totalAmount) {
      newStatus = 'Paid';
    }

    const newPaymentRecord = {
      paymentId: 'PAY-' + Math.floor(1000 + Math.random() * 9000),
      amount: paymentAmount,
      date: new Date().toISOString(),
      method,
      reference: reference || `REF-${Date.now().toString().slice(-6)}`,
      notes: notes || '',
      recordedBy: req.user ? req.user.name : 'Finance Staff'
    };

    const updatedPayments = [...(inv.payments || []), newPaymentRecord];

    const updatedInvoice = dbStore.collection('invoices').findByIdAndUpdate(inv._id, {
      paidAmount: newPaid,
      balanceAmount: newBalance,
      status: newStatus,
      payments: updatedPayments
    });

    // Also sync status on Sales Order
    if (inv.salesOrder) {
      dbStore.collection('salesOrders').findByIdAndUpdate(inv.salesOrder, {
        paymentStatus: newStatus
      });
    }

    // Create Notification
    dbStore.collection('notifications').create({
      title: 'Payment Recorded',
      message: `Payment of ₹${paymentAmount.toLocaleString('en-IN')} recorded for ${inv.invoiceNumber} via ${method}.`,
      type: 'SUCCESS',
      module: 'SALES',
      link: '/sales/invoices'
    });

    // Audit Log
    await logAction({
      action: `Recorded payment of ₹${paymentAmount.toLocaleString('en-IN')} for ${inv.invoiceNumber}`,
      module: 'SALES',
      user: req.user ? req.user.name : 'Finance Staff',
      role: req.user ? req.user.role : 'Finance Staff',
      details: {
        invoiceNumber: inv.invoiceNumber,
        amount: paymentAmount,
        method,
        reference: newPaymentRecord.reference,
        newStatus,
        remainingBalance: newBalance
      }
    });

    res.json({
      success: true,
      message: `Payment recorded successfully. New balance: ₹${newBalance.toLocaleString('en-IN')}`,
      invoice: updatedInvoice,
      payment: newPaymentRecord
    });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ success: false, message: 'Server error recording payment' });
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  recordPayment
};
