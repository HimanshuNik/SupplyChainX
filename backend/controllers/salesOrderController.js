const { dbStore } = require('../utils/dbStore');
const { logAction } = require('../utils/auditLogger');

// @desc    Get all sales orders
// @route   GET /api/sales-orders
// @access  Private
const getSalesOrders = async (req, res) => {
  try {
    const { status, customerId, warehouseId, search } = req.query;
    let orders = dbStore.collection('salesOrders').find().sort({ createdAt: -1 });

    if (status && status !== 'All') {
      orders = orders.filter(so => so.status === status);
    }
    if (customerId && customerId !== 'All') {
      orders = orders.filter(so => so.customer === customerId);
    }
    if (warehouseId && warehouseId !== 'All') {
      orders = orders.filter(so => so.warehouse === warehouseId);
    }
    if (search) {
      const q = search.toLowerCase();
      orders = orders.filter(so =>
        so.orderNumber.toLowerCase().includes(q) ||
        so.customerName.toLowerCase().includes(q) ||
        so.warehouseName.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching sales orders' });
  }
};

// @desc    Get single sales order
// @route   GET /api/sales-orders/:id
// @access  Private
const getSalesOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const so = dbStore.collection('salesOrders').findById(id) || dbStore.collection('salesOrders').findOne({ orderNumber: id });

    if (!so) {
      return res.status(404).json({ success: false, message: 'Sales order not found' });
    }

    const invoice = dbStore.collection('invoices').findOne({ salesOrder: so._id });

    res.json({ success: true, order: so, invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching sales order' });
  }
};

// @desc    Create sales order with automatic stock validation, deduction & invoice creation!
// @route   POST /api/sales-orders
// @access  Private (Admin, Sales Manager)
const createSalesOrder = async (req, res) => {
  try {
    const { customerId, warehouseId, items, discount = 0, notes } = req.body;

    if (!customerId || !warehouseId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Customer, warehouse, and order items are required' });
    }

    const customer = dbStore.collection('customers').findById(customerId);
    const warehouse = dbStore.collection('warehouses').findById(warehouseId);

    if (!customer || !warehouse) {
      return res.status(404).json({ success: false, message: 'Customer or warehouse not found' });
    }

    const invCol = dbStore.collection('inventory');
    const prodCol = dbStore.collection('products');
    const products = prodCol.find().toArray();
    const prodMap = {};
    products.forEach(p => { prodMap[p._id] = p; });

    // Step 1: Validate available stock for EVERY item before modifying any data
    for (const item of items) {
      const prod = prodMap[item.productId];
      const reqQty = Number(item.quantity) || 1;

      if (!prod) {
        return res.status(400).json({ success: false, message: `Product ID ${item.productId} not found` });
      }

      const inv = invCol.findOne({ product: item.productId, warehouse: warehouseId });
      const available = inv ? Math.max(0, (inv.quantity || 0) - (inv.reservedQuantity || 0)) : 0;

      if (available < reqQty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${prod.name}" in ${warehouse.name}. Available: ${available} units, Requested: ${reqQty} units.`
        });
      }
    }

    // Step 2: Prepare Items and calculate financial totals
    let subtotal = 0;
    const formattedItems = items.map(item => {
      const prod = prodMap[item.productId];
      const qty = Number(item.quantity) || 1;
      const price = Number(item.unitPrice) || (prod ? prod.sellingPrice : 0);
      const total = qty * price;
      subtotal += total;

      return {
        product: item.productId,
        productName: prod ? prod.name : 'Product',
        sku: prod ? prod.sku : 'SKU',
        quantity: qty,
        unitPrice: price,
        totalPrice: total
      };
    });

    const disc = Number(discount) || 0;
    const tax = Math.round((subtotal - disc) * 0.18);
    const totalAmount = Math.max(0, subtotal - disc + tax);

    // Step 3: Deduct inventory & record StockTransaction for each item
    const txCol = dbStore.collection('stockTransactions');
    const allSOs = dbStore.collection('salesOrders').find().toArray();
    const orderNumber = 'SO-' + (2000 + allSOs.length + 1);

    for (const item of formattedItems) {
      const inv = invCol.findOne({ product: item.product, warehouse: warehouseId });
      const prevQty = inv.quantity;
      const newQty = prevQty - item.quantity;

      invCol.findByIdAndUpdate(inv._id, { quantity: newQty });

      txCol.create({
        type: 'OUT',
        product: item.product,
        productName: item.productName,
        sku: item.sku,
        warehouse: warehouse._id,
        warehouseName: warehouse.name,
        quantity: item.quantity,
        previousQuantity: prevQty,
        newQuantity: newQty,
        referenceType: 'SALES_ORDER',
        referenceId: orderNumber,
        reason: `Dispatched to customer ${customer.name} (Order #${orderNumber})`,
        performedBy: req.user ? req.user.name : 'Sales Manager'
      });
    }

    // Step 4: Create Sales Order record
    const newSO = dbStore.collection('salesOrders').create({
      orderNumber,
      customer: customer._id,
      customerName: customer.name,
      warehouse: warehouse._id,
      warehouseName: warehouse.name,
      orderDate: new Date().toISOString(),
      items: formattedItems,
      subtotal,
      tax,
      discount: disc,
      totalAmount,
      status: 'Confirmed',
      paymentStatus: 'Pending',
      notes: notes || '',
      createdBy: req.user ? req.user.name : 'Sales Manager',
      invoiceGenerated: true
    });

    // Step 5: Automatically generate corresponding Invoice!
    const allInvs = dbStore.collection('invoices').find().toArray();
    const invoiceNumber = 'INV-' + (2000 + allInvs.length + 1);

    const newInvoice = dbStore.collection('invoices').create({
      invoiceNumber,
      salesOrder: newSO._id,
      salesOrderNumber: newSO.orderNumber,
      customer: customer._id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerAddress: customer.address || `${customer.city || 'City'}, India`,
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString(),
      items: formattedItems,
      subtotal,
      tax,
      discount: disc,
      totalAmount,
      paidAmount: 0,
      balanceAmount: totalAmount,
      status: 'Pending',
      payments: []
    });

    // Step 6: Create Notification
    dbStore.collection('notifications').create({
      title: 'New Sales Order Created',
      message: `Sales Order ${orderNumber} created for ${customer.name}. Invoice ${invoiceNumber} issued for ₹${totalAmount.toLocaleString('en-IN')}.`,
      type: 'INFO',
      module: 'SALES',
      link: '/sales/orders'
    });

    // Step 7: Record Audit Log
    await logAction({
      action: `Created Sales Order ${orderNumber} for ${customer.name}`,
      module: 'SALES',
      user: req.user ? req.user.name : 'Sales Manager',
      role: req.user ? req.user.role : 'Sales Manager',
      details: {
        orderNumber,
        invoiceNumber,
        customer: customer.name,
        warehouse: warehouse.name,
        totalAmount: `₹${totalAmount.toLocaleString('en-IN')}`,
        itemsCount: formattedItems.length
      }
    });

    res.status(201).json({
      success: true,
      message: `Order ${orderNumber} confirmed. Stock deducted and Invoice ${invoiceNumber} created.`,
      order: newSO,
      invoice: newInvoice
    });
  } catch (error) {
    console.error('Create sales order error:', error);
    res.status(500).json({ success: false, message: 'Server error creating sales order' });
  }
};

// @desc    Update sales order status
// @route   PUT /api/sales-orders/:id/status
// @access  Private (Admin, Sales Manager)
const updateSalesOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = dbStore.collection('salesOrders').findByIdAndUpdate(id, { status });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Sales order not found' });
    }

    await logAction({
      action: `Updated Sales Order ${updated.orderNumber} to ${status}`,
      module: 'SALES',
      user: req.user ? req.user.name : 'Staff',
      role: req.user ? req.user.role : 'Staff'
    });

    res.json({ success: true, order: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating status' });
  }
};

module.exports = {
  getSalesOrders,
  getSalesOrderById,
  createSalesOrder,
  updateSalesOrderStatus
};
