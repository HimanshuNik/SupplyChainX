const express = require('express');
const router = express.Router();
const {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  approvePurchaseOrder,
  receiveGoods
} = require('../controllers/purchaseOrderController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getPurchaseOrders);
router.get('/:id', protect, getPurchaseOrderById);
router.post('/', protect, createPurchaseOrder);
router.post('/:id/approve', protect, approvePurchaseOrder);
router.post('/:id/receive', protect, receiveGoods);

module.exports = router;
