const { dbStore } = require('../utils/dbStore');
const { logAction } = require('../utils/auditLogger');

// @desc    Get all customers with aggregate metrics
// @route   GET /api/customers
// @access  Private
const getCustomers = async (req, res) => {
  try {
    const { search, status } = req.query;
    let customers = dbStore.collection('customers').find().toArray();
    const salesOrders = dbStore.collection('salesOrders').find().toArray();
    const invoices = dbStore.collection('invoices').find().toArray();

    let enriched = customers.map(cust => {
      const orders = salesOrders.filter(so => so.customer === cust._id);
      const custInvoices = invoices.filter(inv => inv.customer === cust._id);
      
      const totalSpent = custInvoices.reduce((sum, inv) => sum + (Number(inv.paidAmount) || 0), 0);
      const outstandingReceivable = custInvoices.reduce((sum, inv) => sum + (Number(inv.balanceAmount) || 0), 0);

      return {
        ...cust,
        totalOrders: orders.length,
        totalSpent,
        outstandingReceivable
      };
    });

    if (search) {
      const q = search.toLowerCase();
      enriched = enriched.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.company && c.company.toLowerCase().includes(q)) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q)
      );
    }

    if (status && status !== 'All') {
      enriched = enriched.filter(c => c.status === status);
    }

    res.json({ success: true, count: enriched.length, customers: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching customers' });
  }
};

// @desc    Get single customer details
// @route   GET /api/customers/:id
// @access  Private
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = dbStore.collection('customers').findById(id);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const orders = dbStore.collection('salesOrders').find({ customer: customer._id }).toArray();
    const invoices = dbStore.collection('invoices').find({ customer: customer._id }).toArray();

    res.json({
      success: true,
      customer: {
        ...customer,
        orders,
        invoices
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching customer' });
  }
};

// @desc    Create customer
// @route   POST /api/customers
// @access  Private (Admin, Sales Manager)
const createCustomer = async (req, res) => {
  try {
    const { name, company, email, phone, address, city, taxId, creditLimit } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Customer name, email, and phone are required' });
    }

    const newCustomer = dbStore.collection('customers').create({
      name,
      company: company || name,
      email,
      phone,
      address: address || '',
      city: city || '',
      taxId: taxId || '',
      creditLimit: Number(creditLimit) || 500000,
      outstandingReceivable: 0,
      status: 'Active'
    });

    await logAction({
      action: `Created customer ${newCustomer.name}`,
      module: 'SALES',
      user: req.user ? req.user.name : 'Sales Manager',
      role: req.user ? req.user.role : 'Sales Manager'
    });

    res.status(201).json({ success: true, customer: newCustomer });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating customer' });
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private (Admin, Sales Manager)
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = dbStore.collection('customers').findByIdAndUpdate(id, req.body);

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    await logAction({
      action: `Updated customer ${updated.name}`,
      module: 'SALES',
      user: req.user ? req.user.name : 'Sales Manager',
      role: req.user ? req.user.role : 'Sales Manager'
    });

    res.json({ success: true, customer: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating customer' });
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer
};
