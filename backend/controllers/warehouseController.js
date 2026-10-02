const { dbStore } = require('../utils/dbStore');
const { logAction } = require('../utils/auditLogger');

// @desc    Get all warehouses with calculated inventory counts & values
// @route   GET /api/warehouses
// @access  Private
const getWarehouses = async (req, res) => {
  try {
    const warehouses = dbStore.collection('warehouses').find().toArray();
    const inventory = dbStore.collection('inventory').find().toArray();
    const products = dbStore.collection('products').find().toArray();

    const productPriceMap = {};
    products.forEach(p => {
      productPriceMap[p._id] = Number(p.purchasePrice) || 0;
    });

    const enriched = warehouses.map(wh => {
      const whInvs = inventory.filter(i => i.warehouse === wh._id);
      
      const distinctProductsCount = whInvs.filter(i => i.quantity > 0).length;
      const totalUnits = whInvs.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);
      
      let stockValue = 0;
      whInvs.forEach(i => {
        const unitPrice = productPriceMap[i.product] || 0;
        stockValue += (Number(i.quantity) || 0) * unitPrice;
      });

      const utilization = wh.capacityUnits > 0 ? ((totalUnits / wh.capacityUnits) * 100).toFixed(1) : 0;

      return {
        ...wh,
        totalProducts: distinctProductsCount,
        totalUnits,
        stockValue,
        utilization
      };
    });

    res.json({ success: true, warehouses: enriched });
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    res.status(500).json({ success: false, message: 'Server error fetching warehouses' });
  }
};

// @desc    Get single warehouse details
// @route   GET /api/warehouses/:id
// @access  Private
const getWarehouseById = async (req, res) => {
  try {
    const { id } = req.params;
    const wh = dbStore.collection('warehouses').findById(id);

    if (!wh) {
      return res.status(404).json({ success: false, message: 'Warehouse not found' });
    }

    const inventory = dbStore.collection('inventory').find({ warehouse: wh._id }).toArray();
    const products = dbStore.collection('products').find().toArray();
    const transactions = dbStore.collection('stockTransactions').find({ warehouse: wh._id }).toArray();

    const productMap = {};
    products.forEach(p => {
      productMap[p._id] = p;
    });

    let stockValue = 0;
    const warehouseProducts = inventory.map(item => {
      const prod = productMap[item.product] || { name: 'Unknown', sku: 'N/A', purchasePrice: 0, category: 'General' };
      const itemValue = (Number(item.quantity) || 0) * (Number(prod.purchasePrice) || 0);
      stockValue += itemValue;

      return {
        inventoryId: item._id,
        productId: item.product,
        name: prod.name,
        sku: prod.sku,
        category: prod.category,
        quantity: item.quantity,
        reservedQuantity: item.reservedQuantity,
        available: Math.max(0, item.quantity - item.reservedQuantity),
        aisleLocation: item.aisleLocation,
        purchasePrice: prod.purchasePrice,
        itemValue
      };
    });

    const totalUnits = warehouseProducts.reduce((sum, p) => sum + p.quantity, 0);

    res.json({
      success: true,
      warehouse: {
        ...wh,
        totalProducts: warehouseProducts.filter(p => p.quantity > 0).length,
        totalUnits,
        stockValue,
        products: warehouseProducts,
        recentTransactions: transactions.slice(0, 10)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching warehouse' });
  }
};

// @desc    Create new warehouse
// @route   POST /api/warehouses
// @access  Private (Admin)
const createWarehouse = async (req, res) => {
  try {
    const { name, code, location, address, manager, contactPhone, capacityUnits } = req.body;

    if (!name || !code || !location) {
      return res.status(400).json({ success: false, message: 'Name, code, and location are required' });
    }

    const existing = dbStore.collection('warehouses').findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Warehouse code already exists' });
    }

    const newWh = dbStore.collection('warehouses').create({
      name,
      code: code.toUpperCase(),
      location,
      address: address || '',
      manager: manager || 'Warehouse Manager',
      contactPhone: contactPhone || '',
      capacityUnits: Number(capacityUnits) || 50000,
      status: 'Active'
    });

    // Populate inventory rows for existing products with 0 qty
    const products = dbStore.collection('products').find().toArray();
    products.forEach(p => {
      dbStore.collection('inventory').create({
        product: p._id,
        warehouse: newWh._id,
        quantity: 0,
        reservedQuantity: 0,
        aisleLocation: 'A-01-01'
      });
    });

    await logAction({
      action: `Created warehouse ${newWh.name} (${newWh.code})`,
      module: 'WAREHOUSE',
      user: req.user ? req.user.name : 'Admin',
      role: req.user ? req.user.role : 'Admin'
    });

    res.status(201).json({ success: true, warehouse: newWh });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating warehouse' });
  }
};

// @desc    Update warehouse
// @route   PUT /api/warehouses/:id
// @access  Private (Admin)
const updateWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = dbStore.collection('warehouses').findByIdAndUpdate(id, req.body);

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Warehouse not found' });
    }

    await logAction({
      action: `Updated warehouse ${updated.name}`,
      module: 'WAREHOUSE',
      user: req.user ? req.user.name : 'Staff',
      role: req.user ? req.user.role : 'Staff'
    });

    res.json({ success: true, warehouse: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating warehouse' });
  }
};

module.exports = {
  getWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse
};
