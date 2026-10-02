const express = require('express');
const router = express.Router();
const { getInvoices, getInvoiceById, recordPayment } = require('../controllers/invoiceController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getInvoices);
router.get('/:id', protect, getInvoiceById);
router.post('/:id/payments', protect, recordPayment);

module.exports = router;
