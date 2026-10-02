const { dbStore } = require('../utils/dbStore');
const { logAction } = require('../utils/auditLogger');

// @desc    Get all purchase orders
// @route   GET /api/purchase-orders
// @access  Private
const getPurchaseOrders = async (req, res) => {
  try {
    const { status, supplierId, warehouseId, search } = req.query;
    let orders = dbStore.collection('purchaseOrders').find().sort({ createdAt: -1 });

    if (status && status !== 'All') {
      orders = orders.filter(po => po.status === status);
    }
    if (supplierId && supplierId !== 'All') {
      orders = orders.filter(po => po.supplier === supplierId);
    }
    if (warehouseId && warehouseId !== 'All') {
      orders = orders.filter(po => po.warehouse === warehouseId);
    }
    if (search) {
      const q = search.toLowerCase();
      orders = orders.filter(po =>
        po.poNumber.toLowerCase().includes(q) ||
        po.supplierName.toLowerCase().includes(q) ||
        po.warehouseName.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching purchase orders' });
  }
};

// @desc    Get single purchase order
// @route   GET /api/purchase-orders/:id
// @access  Private
const getPurchaseOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const po = dbStore.collection('purchaseOrders').findById(id) || dbStore.collection('purchaseOrders').findOne({ poNumber: id });

    if (!po) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    res.json({ success: true, order: po });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching purchase order' });
  }
};

// @desc    Create purchase order
// @route   POST /api/purchase-orders
// @access  Private (Admin, Purchase Manager)
const createPurchaseOrder = async (req, res) => {
  try {
    const { supplierId, warehouseId, items, expectedDate, notes } = req.body;

    if (!supplierId || !warehouseId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Supplier, warehouse, and at least one item are required' });
    }

    const supplier = dbStore.collection('suppliers').findById(supplierId);
    const warehouse = dbStore.collection('warehouses').findById(warehouseId);

    if (!supplier || !warehouse) {
      return res.status(404).json({ success: false, message: 'Supplier or warehouse not found' });
    }

    const products = dbStore.collection('products').find().toArray();
    const prodMap = {};
    products.forEach(p => { prodMap[p._id] = p; });

    let subtotal = 0;
    const formattedItems = items.map(item => {
      const prod = prodMap[item.productId];
      const qty = Number(item.orderQty) || 1;
      const price = Number(item.unitPrice) || (prod ? prod.purchasePrice : 0);
      const total = qty * price;
      subtotal += total;

      return {
        product: item.productId,
        productName: prod ? prod.name : (item.productName || 'Product'),
        sku: prod ? prod.sku : (item.sku || 'SKU'),
        orderQty: qty,
        receivedQty: 0,
        unitPrice: price,
        totalPrice: total
      };
    });

    const tax = Math.round(subtotal * 0.18);
    const totalAmount = subtotal + tax;

    const allPOs = dbStore.collection('purchaseOrders').find().toArray();
    const poNumber = 'PO-' + (1000 + allPOs.length + 1);

    const newPO = dbStore.collection('purchaseOrders').create({
      poNumber,
      supplier: supplier._id,
      supplierName: supplier.name,
      warehouse: warehouse._id,
      warehouseName: warehouse.name,
      orderDate: new Date().toISOString(),
      expectedDate: expectedDate || new Date(Date.now() + 7 * 86400000).toISOString(),
      items: formattedItems,
      subtotal,
      tax,
      totalAmount,
      status: 'Pending',
      paymentStatus: 'Pending',
      notes: notes || '',
      createdBy: req.user ? req.user.name : 'Purchase Manager'
    });

    await logAction({
      action: `Created Purchase Order ${newPO.poNumber} for ${supplier.name}`,
      module: 'PROCUREMENT',
      user: req.user ? req.user.name : 'Purchase Manager',
      role: req.user ? req.user.role : 'Purchase Manager',
      details: { poNumber: newPO.poNumber, totalAmount: `₹${totalAmount.toLocaleString('en-IN')}`, itemsCount: formattedItems.length }
    });

    res.status(201).json({ success: true, order: newPO });
  } catch (error) {
    console.error('Create PO error:', error);
    res.status(500).json({ success: false, message: 'Server error creating purchase order' });
  }
};

// @desc    Approve purchase order
// @route   POST /api/purchase-orders/:id/approve
// @access  Private (Admin)
const approvePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const po = dbStore.collection('purchaseOrders').findById(id);

    if (!po) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    if (po.status !== 'Pending') {
      return res.status(400).json({ success: false, message: `PO is already in '${po.status}' status` });
    }

    const updated = dbStore.collection('purchaseOrders').findByIdAndUpdate(id, {
      status: 'Approved',
      approvedBy: req.user ? req.user.name : 'Rahul Sharma (Admin)',
      approvedAt: new Date().toISOString()
    });

    dbStore.collection('notifications').create({
      title: 'Purchase Order Approved',
      message: `${po.poNumber} from ${po.supplierName} has been approved for receiving.`,
      type: 'SUCCESS',
      module: 'PROCUREMENT',
      link: '/procurement/orders'
    });

    await logAction({
      action: `Approved Purchase Order ${po.poNumber}`,
      module: 'PROCUREMENT',
      user: req.user ? req.user.name : 'Admin',
      role: req.user ? req.user.role : 'Admin',
      details: { poNumber: po.poNumber, amount: po.totalAmount }
    });

    res.json({ success: true, message: `PO ${po.poNumber} approved successfully`, order: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error approving purchase order' });
  }
};

// @desc    Goods Receiving workflow: inspect and receive products into warehouse inventory
// @route   POST /api/purchase-orders/:id/receive
// @access  Private (Admin, Inventory Manager, Purchase Manager)
const receiveGoods = async (req, res) => {
  try {
    const { id } = req.params;
    const { receivedItems } = req.body; // Array of { productId, receivedQty }

    const po = dbStore.collection('purchaseOrders').findById(id);
    if (!po) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    if (po.status !== 'Approved' && po.status !== 'Ordered' && po.status !== 'Partially Received') {
      return res.status(400).json({
        success: false,
        message: `Cannot receive goods for PO in '${po.status}' status. PO must be Approved first.`
      });
    }

    const invCol = dbStore.collection('inventory');
    const txCol = dbStore.collection('stockTransactions');
    const updatedItems = [...po.items];
    let allFullyReceived = true;
    let anyReceived = false;

    // Process receiving for each item
    for (let i = 0; i < updatedItems.length; i++) {
      const item = updatedItems[i];
      let addQty = 0;

      if (receivedItems && Array.isArray(receivedItems)) {
        const match = receivedItems.find(r => r.productId === item.product || r.sku === item.sku);
        if (match) {
          addQty = Number(match.receivedQty) || 0;
        }
      } else {
        // If not specified individually, receive the full remaining quantity
        addQty = item.orderQty - item.receivedQty;
      }

      if (addQty > 0) {
        anyReceived = true;
        const previousItemReceived = item.receivedQty || 0;
        item.receivedQty = previousItemReceived + addQty;

        // Update warehouse inventory!
        let inv = invCol.findOne({ product: item.product, warehouse: po.warehouse });
        if (!inv) {
          inv = invCol.create({ product: item.product, warehouse: po.warehouse, quantity: 0, reservedQuantity: 0 });
        }

        const prevStock = inv.quantity;
        const newStock = prevStock + addQty;
        invCol.findByIdAndUpdate(inv._id, { quantity: newStock });

        // Record stock transaction
        txCol.create({
          type: 'IN',
          product: item.product,
          productName: item.productName,
          sku: item.sku,
          warehouse: po.warehouse,
          warehouseName: po.warehouseName,
          quantity: addQty,
          previousQuantity: prevStock,
          newQuantity: newStock,
          referenceType: 'PURCHASE_ORDER',
          referenceId: po.poNumber,
          reason: `Goods receipt for PO ${po.poNumber} (${item.productName})`,
          performedBy: req.user ? req.user.name : 'Warehouse Receiving Staff'
        });
      }

      if (item.receivedQty < item.orderQty) {
        allFullyReceived = false;
      }
    }

    if (!anyReceived) {
      return res.status(400).json({ success: false, message: 'No valid received quantities provided' });
    }

    const newStatus = allFullyReceived ? 'Received' : 'Partially Received';

    const updatedPO = dbStore.collection('purchaseOrders').findByIdAndUpdate(po._id, {
      items: updatedItems,
      status: newStatus,
      receivedAt: new Date().toISOString()
    });

    // Create Notification
    dbStore.collection('notifications').create({
      title: 'Goods Received & Stock Updated',
      message: `Goods receipt processed for ${po.poNumber}. Stock automatically updated in ${po.warehouseName}.`,
      type: 'SUCCESS',
      module: 'INVENTORY',
      link: '/inventory/products'
    });

    // Audit Log
    await logAction({
      action: `Goods Receiving: ${po.poNumber} (${newStatus})`,
      module: 'PROCUREMENT',
      user: req.user ? req.user.name : 'Warehouse Receiving Staff',
      role: req.user ? req.user.role : 'Warehouse Staff',
      details: {
        poNumber: po.poNumber,
        warehouse: po.warehouseName,
        status: newStatus,
        itemsReceived: updatedItems.map(it => ({ sku: it.sku, received: it.receivedQty, ordered: it.orderQty }))
      }
    });

    res.json({
      success: true,
      message: `Goods receipt confirmed. Inventory updated in ${po.warehouseName}.`,
      order: updatedPO,
      status: newStatus
    });
  } catch (error) {
    console.error('Receiving error:', error);
    res.status(500).json({ success: false, message: 'Server error processing goods receipt' });
  }
};

module.exports = {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  approvePurchaseOrder,
  receiveGoods
};
