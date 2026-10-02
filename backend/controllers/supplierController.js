const { dbStore } = require('../utils/dbStore');
const { logAction } = require('../utils/auditLogger');

// @desc    Get all suppliers with metrics
// @route   GET /api/suppliers
// @access  Private
const getSuppliers = async (req, res) => {
  try {
    const { search, status } = req.query;
    let suppliers = dbStore.collection('suppliers').find().toArray();
    const purchaseOrders = dbStore.collection('purchaseOrders').find().toArray();

    let enriched = suppliers.map(sup => {
      const orders = purchaseOrders.filter(po => po.supplier === sup._id);
      const totalSpend = orders.reduce((sum, po) => sum + (Number(po.totalAmount) || 0), 0);
      
      return {
        ...sup,
        totalOrders: orders.length,
        totalSpend,
        productsCount: (sup.categories || []).length || 4
      };
    });

    if (search) {
      const q = search.toLowerCase();
      enriched = enriched.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.contactPerson.toLowerCase().includes(q)
      );
    }

    if (status && status !== 'All') {
      enriched = enriched.filter(s => s.status === status);
    }

    res.json({ success: true, count: enriched.length, suppliers: enriched });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ success: false, message: 'Server error fetching suppliers' });
  }
};

// @desc    Get single supplier details with PO history
// @route   GET /api/suppliers/:id
// @access  Private
const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    const sup = dbStore.collection('suppliers').findById(id);

    if (!sup) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    const orders = dbStore.collection('purchaseOrders').find({ supplier: sup._id }).toArray();
    const products = dbStore.collection('products').find({ preferredSupplier: sup.name }).toArray();

    res.json({
      success: true,
      supplier: {
        ...sup,
        orders,
        productsSupplied: products
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching supplier details' });
  }
};

// @desc    Create supplier
// @route   POST /api/suppliers
// @access  Private (Admin, Purchase Manager)
const createSupplier = async (req, res) => {
  try {
    const { name, code, email, phone, address, city, contactPerson, paymentTerms, categories, rating } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Supplier name, email, and phone are required' });
    }

    const supCode = code ? code.toUpperCase() : 'SUP-' + Math.floor(100 + Math.random() * 900);
    const existing = dbStore.collection('suppliers').findOne({ code: supCode });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Supplier code already exists' });
    }

    const newSup = dbStore.collection('suppliers').create({
      name,
      code: supCode,
      email,
      phone,
      address: address || '',
      city: city || '',
      contactPerson: contactPerson || name,
      paymentTerms: paymentTerms || 'Net 30',
      categories: Array.isArray(categories) ? categories : (categories ? categories.split(',').map(s => s.trim()) : ['General']),
      rating: Number(rating) || 4.5,
      status: 'Active',
      outstandingPayable: 0
    });

    await logAction({
      action: `Created supplier ${newSup.name} (${newSup.code})`,
      module: 'PROCUREMENT',
      user: req.user ? req.user.name : 'Purchase Manager',
      role: req.user ? req.user.role : 'Purchase Manager'
    });

    res.status(201).json({ success: true, supplier: newSup });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating supplier' });
  }
};

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private (Admin, Purchase Manager)
const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = dbStore.collection('suppliers').findByIdAndUpdate(id, req.body);

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    await logAction({
      action: `Updated supplier ${updated.name}`,
      module: 'PROCUREMENT',
      user: req.user ? req.user.name : 'Purchase Manager',
      role: req.user ? req.user.role : 'Purchase Manager'
    });

    res.json({ success: true, supplier: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating supplier' });
  }
};

module.exports = {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier
};
