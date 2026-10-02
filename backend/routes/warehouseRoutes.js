const express = require('express');
const router = express.Router();
const { getWarehouses, getWarehouseById, createWarehouse, updateWarehouse } = require('../controllers/warehouseController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getWarehouses);
router.get('/:id', protect, getWarehouseById);
router.post('/', protect, createWarehouse);
router.put('/:id', protect, updateWarehouse);

module.exports = router;
