const express = require('express');
const router = express.Router();
const {
  getSalesOrders,
  getSalesOrderById,
  createSalesOrder,
  updateSalesOrderStatus
} = require('../controllers/salesOrderController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getSalesOrders);
router.get('/:id', protect, getSalesOrderById);
router.post('/', protect, createSalesOrder);
router.put('/:id/status', protect, updateSalesOrderStatus);

module.exports = router;
