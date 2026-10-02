const { dbStore } = require('../utils/dbStore');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const Warehouse = require('../models/Warehouse');
const StockTransaction = require('../models/StockTransaction');
const { getIsConnected } = require('../config/db');
const { logAction } = require('../utils/auditLogger');

// Helper to calculate product status
const getStockStatus = (totalStock, minLevel = 10) => {
  if (totalStock <= 0) return 'Out Stock';
  if (totalStock <= minLevel) return 'Low Stock';
  return 'Available';
};

// @desc    Get all products with stock summary & filtering
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res) => {
  try {
    const { search, category, warehouse, status } = req.query;

    const allProducts = dbStore.collection('products').find().exec ? await dbStore.collection('products').find().exec() : dbStore.collection('products').find().toArray();
    const allInventories = dbStore.collection('inventory').find().exec ? await dbStore.collection('inventory').find().exec() : dbStore.collection('inventory').find().toArray();
    const allWarehouses = dbStore.collection('warehouses').find().exec ? await dbStore.collection('warehouses').find().exec() : dbStore.collection('warehouses').find().toArray();

    // Map stock per product
    let enriched = allProducts.map(prod => {
      let prodInvs = allInventories.filter(inv => inv.product === prod._id || inv.product === prod.id);

      if (warehouse && warehouse !== 'All') {
        prodInvs = prodInvs.filter(inv => inv.warehouse === warehouse);
      }

      const totalStock = prodInvs.reduce((sum, inv) => sum + (Number(inv.quantity) || 0), 0);
      const reservedStock = prodInvs.reduce((sum, inv) => sum + (Number(inv.reservedQuantity) || 0), 0);
      const availableStock = Math.max(0, totalStock - reservedStock);

      const stockStatus = getStockStatus(totalStock, prod.minStockLevel || 10);

      // Warehouse stock breakdown
      const warehouseStock = allWarehouses.map(wh => {
        const item = prodInvs.find(inv => inv.warehouse === wh._id || inv.warehouse === wh.id);
        return {
          warehouseId: wh._id,
          warehouseName: wh.name,
          warehouseCode: wh.code,
          location: wh.location,
          quantity: item ? item.quantity : 0,
          reservedQuantity: item ? item.reservedQuantity : 0,
          aisleLocation: item ? item.aisleLocation : 'N/A'
        };
      });

      return {
        ...prod,
        totalStock,
        reservedStock,
        availableStock,
        status: stockStatus,
        warehouseStock
      };
    });

    // Filter by search
    if (search) {
      const q = search.toLowerCase();
      enriched = enriched.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    // Filter by category
    if (category && category !== 'All') {
      enriched = enriched.filter(p => p.category === category);
    }

    // Filter by status
    if (status && status !== 'All') {
      enriched = enriched.filter(p => p.status === status);
    }

    res.json({
      success: true,
      count: enriched.length,
      products: enriched
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Server error fetching products' });
  }
};

// @desc    Get single product details with warehouse distribution & history
// @route   GET /api/products/:id
// @access  Private
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const prod = dbStore.collection('products').findById(id) || dbStore.collection('products').findOne({ sku: id });

    if (!prod) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const allInventories = dbStore.collection('inventory').find({ product: prod._id }).toArray();
    const allWarehouses = dbStore.collection('warehouses').find().toArray();
    const allTransactions = dbStore.collection('stockTransactions').find({ product: prod._id }).toArray();

    const totalStock = allInventories.reduce((sum, inv) => sum + (Number(inv.quantity) || 0), 0);
    const reservedStock = allInventories.reduce((sum, inv) => sum + (Number(inv.reservedQuantity) || 0), 0);
    const availableStock = Math.max(0, totalStock - reservedStock);

    const warehouseBreakdown = allWarehouses.map(wh => {
      const inv = allInventories.find(i => i.warehouse === wh._id);
      return {
        warehouseId: wh._id,
        warehouseName: wh.name,
        warehouseCode: wh.code,
        location: wh.location,
        quantity: inv ? inv.quantity : 0,
        reservedQuantity: inv ? inv.reservedQuantity : 0,
        aisleLocation: inv ? inv.aisleLocation : 'A-01'
      };
    });

    res.json({
      success: true,
      product: {
        ...prod,
        totalStock,
        reservedStock,
        availableStock,
        stockStatus: getStockStatus(totalStock, prod.minStockLevel),
        warehouseBreakdown,
        transactions: allTransactions.slice(0, 10)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching product details' });
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Admin, Inventory Manager)
const createProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      category,
      description,
      unit,
      purchasePrice,
      sellingPrice,
      taxRate,
      minStockLevel,
      maxStockLevel,
      warehouseId,
      initialQuantity,
      preferredSupplier
    } = req.body;

    if (!name || !sku || !category || purchasePrice === undefined || sellingPrice === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide all required product fields' });
    }

    const existing = dbStore.collection('products').findOne({ sku: sku.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Product SKU already exists' });
    }

    const newProd = dbStore.collection('products').create({
      name,
      sku: sku.toUpperCase(),
      category,
      description: description || '',
      unit: unit || 'pcs',
      purchasePrice: Number(purchasePrice),
      sellingPrice: Number(sellingPrice),
      taxRate: Number(taxRate) || 18,
      minStockLevel: Number(minStockLevel) || 10,
      maxStockLevel: Number(maxStockLevel) || 500,
      preferredSupplier: preferredSupplier || '',
      status: 'Active'
    });

    // Create inventory record in the selected warehouse (or default first warehouse)
    const whs = dbStore.collection('warehouses').find().toArray();
    const targetWhId = warehouseId || (whs[0] ? whs[0]._id : 'wh_nagpur');
    const initQty = Number(initialQuantity) || 0;

    whs.forEach(wh => {
      const isTarget = wh._id === targetWhId;
      dbStore.collection('inventory').create({
        product: newProd._id,
        warehouse: wh._id,
        quantity: isTarget ? initQty : 0,
        reservedQuantity: 0,
        aisleLocation: 'A-01-01'
      });
    });

    if (initQty > 0) {
      const targetWh = whs.find(w => w._id === targetWhId);
      dbStore.collection('stockTransactions').create({
        type: 'IN',
        product: newProd._id,
        productName: newProd.name,
        sku: newProd.sku,
        warehouse: targetWhId,
        warehouseName: targetWh ? targetWh.name : 'Nagpur Hub',
        quantity: initQty,
        previousQuantity: 0,
        newQuantity: initQty,
        referenceType: 'INITIAL_STOCK',
        referenceId: 'INIT-' + newProd.sku,
        reason: 'Initial stock intake upon product creation',
        performedBy: req.user ? req.user.name : 'Admin'
      });
    }

    await logAction({
      action: `Created product ${newProd.sku} (${newProd.name})`,
      module: 'INVENTORY',
      user: req.user ? req.user.name : 'Admin',
      role: req.user ? req.user.role : 'Admin',
      details: { sku: newProd.sku, initialQuantity: initQty }
    });

    res.status(201).json({ success: true, product: newProd });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: 'Server error creating product' });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Admin, Inventory Manager)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = dbStore.collection('products').findByIdAndUpdate(id, req.body);

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await logAction({
      action: `Updated product ${updated.sku}`,
      module: 'INVENTORY',
      user: req.user ? req.user.name : 'Staff',
      role: req.user ? req.user.role : 'Staff',
      details: req.body
    });

    res.json({ success: true, product: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating product' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Admin)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = dbStore.collection('products').findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await logAction({
      action: `Deleted product ${deleted.sku}`,
      module: 'INVENTORY',
      user: req.user ? req.user.name : 'Admin',
      role: req.user ? req.user.role : 'Admin'
    });

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting product' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
