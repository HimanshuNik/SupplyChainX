const express = require('express');
const router = express.Router();
const { transferStock, adjustStock, getStockTransactions, getLowStockItems } = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');

router.post('/transfer', protect, transferStock);
router.post('/adjust', protect, adjustStock);
router.get('/transactions', protect, getStockTransactions);
router.get('/low-stock', protect, getLowStockItems);

module.exports = router;
