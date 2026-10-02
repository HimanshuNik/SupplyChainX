const { dbStore } = require('../utils/dbStore');
const { logAction } = require('../utils/auditLogger');

// @desc    Transfer stock between warehouses
// @route   POST /api/inventory/transfer
// @access  Private (Admin, Inventory Manager)
const transferStock = async (req, res) => {
  try {
    const { fromWarehouseId, toWarehouseId, productId, quantity, reason } = req.body;

    const qty = Number(quantity);
    if (!fromWarehouseId || !toWarehouseId || !productId || !qty || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide valid from/to warehouses, product, and quantity > 0' });
    }

    if (fromWarehouseId === toWarehouseId) {
      return res.status(400).json({ success: false, message: 'Source and destination warehouses cannot be the same' });
    }

    const prod = dbStore.collection('products').findById(productId);
    if (!prod) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const fromWh = dbStore.collection('warehouses').findById(fromWarehouseId);
    const toWh = dbStore.collection('warehouses').findById(toWarehouseId);

    if (!fromWh || !toWh) {
      return res.status(404).json({ success: false, message: 'Warehouse not found' });
    }

    const invCol = dbStore.collection('inventory');
    let fromInv = invCol.findOne({ product: productId, warehouse: fromWarehouseId });
    if (!fromInv) {
      fromInv = invCol.create({ product: productId, warehouse: fromWarehouseId, quantity: 0, reservedQuantity: 0 });
    }

    const available = (fromInv.quantity || 0) - (fromInv.reservedQuantity || 0);
    if (available < qty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient available stock in ${fromWh.name}. Available: ${available} units, requested: ${qty} units.`
      });
    }

    let toInv = invCol.findOne({ product: productId, warehouse: toWarehouseId });
    if (!toInv) {
      toInv = invCol.create({ product: productId, warehouse: toWarehouseId, quantity: 0, reservedQuantity: 0 });
    }

    const prevFromQty = fromInv.quantity;
    const newFromQty = prevFromQty - qty;

    const prevToQty = toInv.quantity;
    const newToQty = prevToQty + qty;

    // Atomically update both records
    invCol.findByIdAndUpdate(fromInv._id, { quantity: newFromQty });
    invCol.findByIdAndUpdate(toInv._id, { quantity: newToQty });

    // Generate unique transfer code
    const transferCode = 'TR-' + Math.floor(1000 + Math.random() * 9000);

    // Record StockTransaction
    const tx = dbStore.collection('stockTransactions').create({
      type: 'TRANSFER',
      product: prod._id,
      productName: prod.name,
      sku: prod.sku,
      warehouse: fromWh._id,
      warehouseName: fromWh.name,
      toWarehouse: toWh._id,
      toWarehouseName: toWh.name,
      quantity: qty,
      previousQuantity: prevFromQty,
      newQuantity: newFromQty,
      referenceType: 'TRANSFER',
      referenceId: transferCode,
      reason: reason || 'Inter-warehouse stock balancing',
      performedBy: req.user ? req.user.name : 'Amit Verma'
    });

    // Create Notification
    dbStore.collection('notifications').create({
      title: 'Stock Transfer Completed',
      message: `${qty} units of ${prod.name} transferred from ${fromWh.name} to ${toWh.name} (#${transferCode}).`,
      type: 'INFO',
      module: 'INVENTORY',
      link: '/inventory/products'
    });

    // Audit Log
    await logAction({
      action: `Stock Transfer: ${qty}x ${prod.sku} from ${fromWh.name} to ${toWh.name}`,
      module: 'INVENTORY',
      user: req.user ? req.user.name : 'Inventory Manager',
      role: req.user ? req.user.role : 'Inventory Manager',
      details: {
        product: prod.name,
        sku: prod.sku,
        from: fromWh.name,
        to: toWh.name,
        quantity: qty,
        transferCode,
        fromOld: prevFromQty,
        fromNew: newFromQty,
        toOld: prevToQty,
        toNew: newToQty
      }
    });

    res.json({
      success: true,
      message: `Successfully transferred ${qty} units of ${prod.name} from ${fromWh.name} to ${toWh.name}`,
      transferCode,
      source: { warehouse: fromWh.name, previousQuantity: prevFromQty, newQuantity: newFromQty },
      destination: { warehouse: toWh.name, previousQuantity: prevToQty, newQuantity: newToQty },
      transaction: tx
    });
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ success: false, message: 'Server error processing stock transfer' });
  }
};

// @desc    Adjust stock quantity manually
// @route   POST /api/inventory/adjust
// @access  Private (Admin, Inventory Manager)
const adjustStock = async (req, res) => {
  try {
    const { productId, warehouseId, newQuantity, reason, adjustmentType } = req.body;

    const qty = Number(newQuantity);
    if (!productId || !warehouseId || isNaN(qty) || qty < 0) {
      return res.status(400).json({ success: false, message: 'Product, warehouse, and valid quantity >= 0 are required' });
    }

    const prod = dbStore.collection('products').findById(productId);
    const wh = dbStore.collection('warehouses').findById(warehouseId);
    if (!prod || !wh) {
      return res.status(404).json({ success: false, message: 'Product or warehouse not found' });
    }

    const invCol = dbStore.collection('inventory');
    let inv = invCol.findOne({ product: productId, warehouse: warehouseId });
    if (!inv) {
      inv = invCol.create({ product: productId, warehouse: warehouseId, quantity: 0, reservedQuantity: 0 });
    }

    const prevQty = inv.quantity;
    invCol.findByIdAndUpdate(inv._id, { quantity: qty });

    const diff = qty - prevQty;

    const tx = dbStore.collection('stockTransactions').create({
      type: 'ADJUSTMENT',
      product: prod._id,
      productName: prod.name,
      sku: prod.sku,
      warehouse: wh._id,
      warehouseName: wh.name,
      quantity: Math.abs(diff),
      previousQuantity: prevQty,
      newQuantity: qty,
      referenceType: 'MANUAL_ADJUSTMENT',
      referenceId: 'ADJ-' + Date.now().toString().slice(-4),
      reason: reason || (diff >= 0 ? 'Surplus audit correction' : 'Damaged / loss write-off'),
      performedBy: req.user ? req.user.name : 'Admin'
    });

    await logAction({
      action: `Stock Adjustment for ${prod.sku} at ${wh.name}: ${prevQty} -> ${qty}`,
      module: 'INVENTORY',
      user: req.user ? req.user.name : 'Admin',
      role: req.user ? req.user.role : 'Admin',
      details: { previous: prevQty, current: qty, difference: diff, reason }
    });

    res.json({
      success: true,
      message: `Stock updated for ${prod.name} at ${wh.name}`,
      previousQuantity: prevQty,
      newQuantity: qty,
      transaction: tx
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error adjusting stock' });
  }
};

// @desc    Get all stock transactions
// @route   GET /api/inventory/transactions
// @access  Private
const getStockTransactions = async (req, res) => {
  try {
    const { type, warehouseId, productId } = req.query;
    let list = dbStore.collection('stockTransactions').find().sort({ createdAt: -1 });

    if (type && type !== 'All') {
      list = list.filter(t => t.type === type);
    }
    if (warehouseId && warehouseId !== 'All') {
      list = list.filter(t => t.warehouse === warehouseId || t.toWarehouse === warehouseId);
    }
    if (productId && productId !== 'All') {
      list = list.filter(t => t.product === productId);
    }

    res.json({ success: true, count: list.length, transactions: list });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching stock transactions' });
  }
};

// @desc    Get low stock items across all warehouses
// @route   GET /api/inventory/low-stock
// @access  Private
const getLowStockItems = async (req, res) => {
  try {
    const products = dbStore.collection('products').find().toArray();
    const inventory = dbStore.collection('inventory').find().toArray();
    const warehouses = dbStore.collection('warehouses').find().toArray();

    const whMap = {};
    warehouses.forEach(w => { whMap[w._id] = w.name; });

    const lowStockList = [];

    products.forEach(p => {
      const prodInvs = inventory.filter(i => i.product === p._id);
      const totalStock = prodInvs.reduce((sum, i) => sum + i.quantity, 0);

      if (totalStock <= (p.minStockLevel || 10)) {
        lowStockList.push({
          productId: p._id,
          name: p.name,
          sku: p.sku,
          category: p.category,
          currentStock: totalStock,
          minStockLevel: p.minStockLevel || 10,
          status: totalStock === 0 ? 'Out Stock' : 'Low Stock',
          warehouseBreakdown: prodInvs.map(i => ({
            warehouseName: whMap[i.warehouse] || 'Warehouse',
            quantity: i.quantity
          }))
        });
      }
    });

    res.json({ success: true, count: lowStockList.length, items: lowStockList });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error checking low stock' });
  }
};

module.exports = {
  transferStock,
  adjustStock,
  getStockTransactions,
  getLowStockItems
};
