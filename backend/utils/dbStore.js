const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_FILE = path.join(__dirname, '..', 'data', 'local_db.json');

// Initial seed builder
const getInitialSeed = () => {
  const hash = bcrypt.hashSync('admin123', 10);
  const managerHash = bcrypt.hashSync('manager123', 10);
  const purchaseHash = bcrypt.hashSync('purchase123', 10);
  const salesHash = bcrypt.hashSync('sales123', 10);

  const users = [
    {
      _id: 'usr_admin',
      name: 'Rahul Sharma',
      email: 'admin@supplychainx.com',
      phone: '+91 98765 43210',
      password: hash,
      role: 'Admin',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      department: 'Executive Management',
      createdAt: new Date('2026-09-01T10:00:00Z').toISOString()
    },
    {
      _id: 'usr_inv',
      name: 'Amit Verma',
      email: 'amit@supplychainx.com',
      phone: '+91 98765 11223',
      password: managerHash,
      role: 'Inventory Manager',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      department: 'Inventory & Warehousing',
      createdAt: new Date('2026-09-05T10:00:00Z').toISOString()
    },
    {
      _id: 'usr_pur',
      name: 'Vikram Singh',
      email: 'vikram@supplychainx.com',
      phone: '+91 98765 33445',
      password: purchaseHash,
      role: 'Purchase Manager',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      department: 'Procurement',
      createdAt: new Date('2026-09-10T10:00:00Z').toISOString()
    },
    {
      _id: 'usr_sale',
      name: 'Priya Patel',
      email: 'priya@supplychainx.com',
      phone: '+91 98765 55667',
      password: salesHash,
      role: 'Sales Manager',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      department: 'Commercial Sales',
      createdAt: new Date('2026-09-12T10:00:00Z').toISOString()
    }
  ];

  const warehouses = [
    {
      _id: 'wh_nagpur',
      name: 'Nagpur Central Hub',
      code: 'WH-NGP-01',
      location: 'Nagpur, Maharashtra',
      address: 'Plot 45, MIHAN SEZ, Wardha Road, Nagpur',
      manager: 'Amit Verma',
      contactPhone: '+91 712 2589001',
      capacityUnits: 50000,
      status: 'Active',
      createdAt: new Date('2026-08-15T09:00:00Z').toISOString()
    },
    {
      _id: 'wh_pune',
      name: 'Pune Distribution Center',
      code: 'WH-PUN-02',
      location: 'Pune, Maharashtra',
      address: 'Chakan Industrial Area, Phase 2, Pune',
      manager: 'Suresh Patil',
      contactPhone: '+91 20 67123400',
      capacityUnits: 40000,
      status: 'Active',
      createdAt: new Date('2026-08-20T09:00:00Z').toISOString()
    },
    {
      _id: 'wh_mumbai',
      name: 'Mumbai Port Logistics Terminal',
      code: 'WH-BOM-03',
      location: 'Navi Mumbai, Maharashtra',
      address: 'Sector 19, JNPT Logistics Park, Navi Mumbai',
      manager: 'Rajesh Kadam',
      contactPhone: '+91 22 27889900',
      capacityUnits: 75000,
      status: 'Active',
      createdAt: new Date('2026-08-25T09:00:00Z').toISOString()
    }
  ];

  const products = [
    {
      _id: 'prod_1001',
      name: 'Mechanical Ergonomic Keyboard',
      sku: 'P-1001',
      category: 'Electronics',
      description: 'Hot-swappable RGB mechanical keyboard with brown tactile switches and aluminum frame.',
      unit: 'pcs',
      purchasePrice: 800,
      sellingPrice: 1500,
      taxRate: 18,
      minStockLevel: 25,
      maxStockLevel: 200,
      preferredSupplier: 'ABC Technologies Ltd',
      status: 'Active',
      createdAt: new Date('2026-09-01T10:00:00Z').toISOString()
    },
    {
      _id: 'prod_1002',
      name: 'Precision Wireless Mouse',
      sku: 'P-1002',
      category: 'Electronics',
      description: '2.4GHz dual Bluetooth optical mouse with 4000 DPI sensor and rechargeable battery.',
      unit: 'pcs',
      purchasePrice: 400,
      sellingPrice: 850,
      taxRate: 18,
      minStockLevel: 20,
      maxStockLevel: 300,
      preferredSupplier: 'XYZ Components Corp',
      status: 'Active',
      createdAt: new Date('2026-09-02T10:00:00Z').toISOString()
    },
    {
      _id: 'prod_1003',
      name: '27-inch 4K IPS Ultra HD Monitor',
      sku: 'P-1003',
      category: 'Electronics',
      description: 'Factory calibrated sRGB 99% monitor with USB-C 65W power delivery and pivot stand.',
      unit: 'pcs',
      purchasePrice: 14000,
      sellingPrice: 22000,
      taxRate: 18,
      minStockLevel: 10,
      maxStockLevel: 100,
      preferredSupplier: 'ABC Technologies Ltd',
      status: 'Active',
      createdAt: new Date('2026-09-03T10:00:00Z').toISOString()
    },
    {
      _id: 'prod_1004',
      name: '8-in-1 Aluminium USB-C Multiport Hub',
      sku: 'P-1004',
      category: 'Peripherals',
      description: 'Features 4K HDMI, 100W PD passthrough, SD/TF card reader, 3x USB 3.0 ports.',
      unit: 'pcs',
      purchasePrice: 650,
      sellingPrice: 1350,
      taxRate: 18,
      minStockLevel: 15,
      maxStockLevel: 250,
      preferredSupplier: 'XYZ Components Corp',
      status: 'Active',
      createdAt: new Date('2026-09-05T10:00:00Z').toISOString()
    },
    {
      _id: 'prod_1005',
      name: 'Industrial Cat6 Shielded Cable 20m',
      sku: 'P-1005',
      category: 'Networking',
      description: 'High-speed gigabit ethernet patch cable with gold plated RJ45 connectors.',
      unit: 'pcs',
      purchasePrice: 180,
      sellingPrice: 420,
      taxRate: 18,
      minStockLevel: 30,
      maxStockLevel: 500,
      preferredSupplier: 'Apex Hardware Distributors',
      status: 'Active',
      createdAt: new Date('2026-09-08T10:00:00Z').toISOString()
    },
    {
      _id: 'prod_1006',
      name: '1500VA Online Rackmount UPS',
      sku: 'P-1006',
      category: 'Industrial',
      description: 'Pure sine wave backup power supply with LCD management console and AVR.',
      unit: 'pcs',
      purchasePrice: 5200,
      sellingPrice: 8900,
      taxRate: 18,
      minStockLevel: 5,
      maxStockLevel: 50,
      preferredSupplier: 'Apex Hardware Distributors',
      status: 'Active',
      createdAt: new Date('2026-09-10T10:00:00Z').toISOString()
    }
  ];

  const inventory = [
    // Mechanical Keyboard
    { _id: 'inv_1', product: 'prod_1001', warehouse: 'wh_nagpur', quantity: 48, reservedQuantity: 8, aisleLocation: 'A-01-04' },
    { _id: 'inv_2', product: 'prod_1001', warehouse: 'wh_pune', quantity: 18, reservedQuantity: 0, aisleLocation: 'B-02-11' },
    { _id: 'inv_3', product: 'prod_1001', warehouse: 'wh_mumbai', quantity: 10, reservedQuantity: 0, aisleLocation: 'C-01-02' },
    // Precision Mouse (Nagpur has 8 -> low stock!)
    { _id: 'inv_4', product: 'prod_1002', warehouse: 'wh_nagpur', quantity: 8, reservedQuantity: 0, aisleLocation: 'A-01-05' },
    { _id: 'inv_5', product: 'prod_1002', warehouse: 'wh_pune', quantity: 28, reservedQuantity: 5, aisleLocation: 'B-02-12' },
    { _id: 'inv_6', product: 'prod_1002', warehouse: 'wh_mumbai', quantity: 15, reservedQuantity: 0, aisleLocation: 'C-01-03' },
    // 27-inch Monitor (Nagpur has 0 -> out of stock!)
    { _id: 'inv_7', product: 'prod_1003', warehouse: 'wh_nagpur', quantity: 0, reservedQuantity: 0, aisleLocation: 'A-02-01' },
    { _id: 'inv_8', product: 'prod_1003', warehouse: 'wh_pune', quantity: 6, reservedQuantity: 2, aisleLocation: 'B-03-01' },
    { _id: 'inv_9', product: 'prod_1003', warehouse: 'wh_mumbai', quantity: 4, reservedQuantity: 0, aisleLocation: 'C-02-01' },
    // USB-C Hub
    { _id: 'inv_10', product: 'prod_1004', warehouse: 'wh_nagpur', quantity: 55, reservedQuantity: 0, aisleLocation: 'A-01-09' },
    { _id: 'inv_11', product: 'prod_1004', warehouse: 'wh_pune', quantity: 42, reservedQuantity: 0, aisleLocation: 'B-02-08' },
    { _id: 'inv_12', product: 'prod_1004', warehouse: 'wh_mumbai', quantity: 25, reservedQuantity: 0, aisleLocation: 'C-01-07' },
    // Ethernet Cable
    { _id: 'inv_13', product: 'prod_1005', warehouse: 'wh_nagpur', quantity: 120, reservedQuantity: 0, aisleLocation: 'A-03-02' },
    { _id: 'inv_14', product: 'prod_1005', warehouse: 'wh_pune', quantity: 80, reservedQuantity: 0, aisleLocation: 'B-04-05' },
    { _id: 'inv_15', product: 'prod_1005', warehouse: 'wh_mumbai', quantity: 45, reservedQuantity: 0, aisleLocation: 'C-03-01' },
    // UPS
    { _id: 'inv_16', product: 'prod_1006', warehouse: 'wh_nagpur', quantity: 14, reservedQuantity: 0, aisleLocation: 'A-04-01' },
    { _id: 'inv_17', product: 'prod_1006', warehouse: 'wh_pune', quantity: 8, reservedQuantity: 0, aisleLocation: 'B-05-02' },
    { _id: 'inv_18', product: 'prod_1006', warehouse: 'wh_mumbai', quantity: 6, reservedQuantity: 0, aisleLocation: 'C-04-01' }
  ];

  const suppliers = [
    {
      _id: 'sup_001',
      name: 'ABC Technologies Ltd',
      code: 'SUP-001',
      email: 'contact@abctech.com',
      phone: '+91 98765 43210',
      address: 'Cyber Towers, HITEC City',
      city: 'Hyderabad',
      contactPerson: 'Rajesh Nair',
      paymentTerms: 'Net 30',
      rating: 4.8,
      categories: ['Electronics', 'Displays'],
      status: 'Active',
      outstandingPayable: 85000,
      createdAt: new Date('2026-08-10T10:00:00Z').toISOString()
    },
    {
      _id: 'sup_002',
      name: 'XYZ Components Corp',
      code: 'SUP-002',
      email: 'sales@xyzcorp.com',
      phone: '+91 87654 32109',
      address: 'Industrial Estate, Phase 3',
      city: 'Bengaluru',
      contactPerson: 'Sunil Rao',
      paymentTerms: 'Net 15',
      rating: 4.6,
      categories: ['Electronics', 'Peripherals'],
      status: 'Active',
      outstandingPayable: 42000,
      createdAt: new Date('2026-08-12T10:00:00Z').toISOString()
    },
    {
      _id: 'sup_003',
      name: 'Apex Hardware Distributors',
      code: 'SUP-003',
      email: 'info@apexdist.com',
      phone: '+91 76543 21098',
      address: 'Lamington Road Commercial Hub',
      city: 'Mumbai',
      contactPerson: 'Karan Mehra',
      paymentTerms: 'Net 45',
      rating: 4.9,
      categories: ['Networking', 'Industrial'],
      status: 'Active',
      outstandingPayable: 72000,
      createdAt: new Date('2026-08-15T10:00:00Z').toISOString()
    }
  ];

  const purchaseOrders = [
    {
      _id: 'po_1001',
      poNumber: 'PO-1001',
      supplier: 'sup_001',
      supplierName: 'ABC Technologies Ltd',
      warehouse: 'wh_nagpur',
      warehouseName: 'Nagpur Central Hub',
      orderDate: new Date('2026-09-15T09:30:00Z').toISOString(),
      expectedDate: new Date('2026-09-22T18:00:00Z').toISOString(),
      items: [
        { product: 'prod_1001', productName: 'Mechanical Ergonomic Keyboard', sku: 'P-1001', orderQty: 50, receivedQty: 50, unitPrice: 800, totalPrice: 40000 },
        { product: 'prod_1002', productName: 'Precision Wireless Mouse', sku: 'P-1002', orderQty: 60, receivedQty: 60, unitPrice: 400, totalPrice: 24000 }
      ],
      subtotal: 64000,
      tax: 11520,
      totalAmount: 75520,
      status: 'Received',
      paymentStatus: 'Paid',
      notes: 'Initial Q3 inventory replenishment for Central Hub.',
      createdBy: 'Vikram Singh',
      approvedBy: 'Rahul Sharma',
      approvedAt: new Date('2026-09-16T11:00:00Z').toISOString(),
      receivedAt: new Date('2026-09-22T14:30:00Z').toISOString()
    },
    {
      _id: 'po_1002',
      poNumber: 'PO-1002',
      supplier: 'sup_002',
      supplierName: 'XYZ Components Corp',
      warehouse: 'wh_nagpur',
      warehouseName: 'Nagpur Central Hub',
      orderDate: new Date('2026-09-25T11:00:00Z').toISOString(),
      expectedDate: new Date('2026-10-05T18:00:00Z').toISOString(),
      items: [
        { product: 'prod_1001', productName: 'Mechanical Ergonomic Keyboard', sku: 'P-1001', orderQty: 50, receivedQty: 0, unitPrice: 800, totalPrice: 40000 },
        { product: 'prod_1002', productName: 'Precision Wireless Mouse', sku: 'P-1002', orderQty: 30, receivedQty: 0, unitPrice: 400, totalPrice: 12000 }
      ],
      subtotal: 52000,
      tax: 9360,
      totalAmount: 61360,
      status: 'Approved',
      paymentStatus: 'Pending',
      notes: 'Replenishing low stock units. Ready for goods receiving.',
      createdBy: 'Vikram Singh',
      approvedBy: 'Rahul Sharma',
      approvedAt: new Date('2026-09-26T16:20:00Z').toISOString()
    },
    {
      _id: 'po_1003',
      poNumber: 'PO-1003',
      supplier: 'sup_001',
      supplierName: 'ABC Technologies Ltd',
      warehouse: 'wh_pune',
      warehouseName: 'Pune Distribution Center',
      orderDate: new Date('2026-09-28T14:15:00Z').toISOString(),
      expectedDate: new Date('2026-10-08T18:00:00Z').toISOString(),
      items: [
        { product: 'prod_1003', productName: '27-inch 4K IPS Ultra HD Monitor', sku: 'P-1003', orderQty: 10, receivedQty: 0, unitPrice: 14000, totalPrice: 140000 }
      ],
      subtotal: 140000,
      tax: 25200,
      totalAmount: 165200,
      status: 'Pending',
      paymentStatus: 'Pending',
      notes: 'Awaiting executive approval from Admin Rahul Sharma.',
      createdBy: 'Vikram Singh'
    }
  ];

  const customers = [
    {
      _id: 'cust_001',
      name: 'ABC Store Enterprises',
      company: 'ABC Store Pvt Ltd',
      email: 'procurement@abcstore.in',
      phone: '+91 91234 56780',
      address: 'Commercial Block B, MG Road',
      city: 'Nagpur',
      taxId: '27AABCA1234F1Z8',
      creditLimit: 500000,
      outstandingReceivable: 0,
      status: 'Active',
      createdAt: new Date('2026-08-18T10:00:00Z').toISOString()
    },
    {
      _id: 'cust_002',
      name: 'XYZ Retail Electronics',
      company: 'XYZ Retail Group',
      email: 'accounts@xyzretail.com',
      phone: '+91 98112 23344',
      address: 'Phoenix Marketcity Retail Mall, Viman Nagar',
      city: 'Pune',
      taxId: '27XYZRC5678G2Z1',
      creditLimit: 800000,
      outstandingReceivable: 18000,
      status: 'Active',
      createdAt: new Date('2026-08-22T10:00:00Z').toISOString()
    },
    {
      _id: 'cust_003',
      name: 'TechMatrix Solutions',
      company: 'TechMatrix IT Services',
      email: 'dev@techmatrix.com',
      phone: '+91 98990 01122',
      address: 'Infotech Tower 4, BKC',
      city: 'Mumbai',
      taxId: '27TCHMX9911K1Z3',
      creditLimit: 1000000,
      outstandingReceivable: 0,
      status: 'Active',
      createdAt: new Date('2026-08-25T10:00:00Z').toISOString()
    }
  ];

  const salesOrders = [
    {
      _id: 'so_2001',
      orderNumber: 'SO-2001',
      customer: 'cust_001',
      customerName: 'ABC Store Enterprises',
      warehouse: 'wh_nagpur',
      warehouseName: 'Nagpur Central Hub',
      orderDate: new Date('2026-09-20T10:00:00Z').toISOString(),
      items: [
        { product: 'prod_1001', productName: 'Mechanical Ergonomic Keyboard', sku: 'P-1001', quantity: 5, unitPrice: 1500, totalPrice: 7500 },
        { product: 'prod_1002', productName: 'Precision Wireless Mouse', sku: 'P-1002', quantity: 10, unitPrice: 850, totalPrice: 8500 },
        { product: 'prod_1004', productName: '8-in-1 Aluminium USB-C Multiport Hub', sku: 'P-1004', quantity: 5, unitPrice: 1350, totalPrice: 6750 }
      ],
      subtotal: 22750,
      tax: 4095,
      discount: 1000,
      totalAmount: 25845,
      status: 'Completed',
      paymentStatus: 'Paid',
      notes: 'Express dispatch delivered via courier partner.',
      createdBy: 'Priya Patel',
      invoiceGenerated: true
    },
    {
      _id: 'so_2002',
      orderNumber: 'SO-2002',
      customer: 'cust_002',
      customerName: 'XYZ Retail Electronics',
      warehouse: 'wh_pune',
      warehouseName: 'Pune Distribution Center',
      orderDate: new Date('2026-09-28T15:30:00Z').toISOString(),
      items: [
        { product: 'prod_1001', productName: 'Mechanical Ergonomic Keyboard', sku: 'P-1001', quantity: 8, unitPrice: 1500, totalPrice: 12000 },
        { product: 'prod_1004', productName: '8-in-1 Aluminium USB-C Multiport Hub', sku: 'P-1004', quantity: 4, unitPrice: 1350, totalPrice: 5400 }
      ],
      subtotal: 17400,
      tax: 3132,
      discount: 532,
      totalAmount: 20000,
      status: 'Processing',
      paymentStatus: 'Pending',
      notes: 'Awaiting packaging & dispatch inspection.',
      createdBy: 'Priya Patel',
      invoiceGenerated: true
    }
  ];

  const invoices = [
    {
      _id: 'inv_doc_2001',
      invoiceNumber: 'INV-2001',
      salesOrder: 'so_2001',
      salesOrderNumber: 'SO-2001',
      customer: 'cust_001',
      customerName: 'ABC Store Enterprises',
      customerEmail: 'procurement@abcstore.in',
      customerAddress: 'Commercial Block B, MG Road, Nagpur',
      issueDate: new Date('2026-09-20T11:00:00Z').toISOString(),
      dueDate: new Date('2026-10-05T18:00:00Z').toISOString(),
      items: [
        { productName: 'Mechanical Ergonomic Keyboard', sku: 'P-1001', quantity: 5, unitPrice: 1500, totalPrice: 7500 },
        { productName: 'Precision Wireless Mouse', sku: 'P-1002', quantity: 10, unitPrice: 850, totalPrice: 8500 },
        { productName: '8-in-1 Aluminium USB-C Multiport Hub', sku: 'P-1004', quantity: 5, unitPrice: 1350, totalPrice: 6750 }
      ],
      subtotal: 22750,
      tax: 4095,
      discount: 1000,
      totalAmount: 25845,
      paidAmount: 25845,
      balanceAmount: 0,
      status: 'Paid',
      payments: [
        {
          paymentId: 'PAY-8801',
          amount: 25845,
          date: new Date('2026-09-22T14:00:00Z').toISOString(),
          method: 'UPI',
          reference: 'UPI/HDFC/20260922889',
          recordedBy: 'Finance'
        }
      ]
    },
    {
      _id: 'inv_doc_2002',
      invoiceNumber: 'INV-2002',
      salesOrder: 'so_2002',
      salesOrderNumber: 'SO-2002',
      customer: 'cust_002',
      customerName: 'XYZ Retail Electronics',
      customerEmail: 'accounts@xyzretail.com',
      customerAddress: 'Phoenix Marketcity Retail Mall, Pune',
      issueDate: new Date('2026-09-28T16:00:00Z').toISOString(),
      dueDate: new Date('2026-10-12T18:00:00Z').toISOString(),
      items: [
        { productName: 'Mechanical Ergonomic Keyboard', sku: 'P-1001', quantity: 8, unitPrice: 1500, totalPrice: 12000 },
        { productName: '8-in-1 Aluminium USB-C Multiport Hub', sku: 'P-1004', quantity: 4, unitPrice: 1350, totalPrice: 5400 }
      ],
      subtotal: 17400,
      tax: 3132,
      discount: 532,
      totalAmount: 20000,
      paidAmount: 0,
      balanceAmount: 20000,
      status: 'Pending',
      payments: []
    }
  ];

  const stockTransactions = [
    {
      _id: 'tx_01',
      type: 'IN',
      product: 'prod_1001',
      productName: 'Mechanical Ergonomic Keyboard',
      sku: 'P-1001',
      warehouse: 'wh_nagpur',
      warehouseName: 'Nagpur Central Hub',
      quantity: 50,
      previousQuantity: 18,
      newQuantity: 68,
      referenceType: 'PURCHASE_ORDER',
      referenceId: 'PO-1001',
      reason: 'Goods received from ABC Technologies',
      performedBy: 'Amit Verma',
      createdAt: new Date('2026-09-22T14:30:00Z').toISOString()
    },
    {
      _id: 'tx_02',
      type: 'TRANSFER',
      product: 'prod_1001',
      productName: 'Mechanical Ergonomic Keyboard',
      sku: 'P-1001',
      warehouse: 'wh_nagpur',
      warehouseName: 'Nagpur Central Hub',
      toWarehouse: 'wh_pune',
      toWarehouseName: 'Pune Distribution Center',
      quantity: 20,
      previousQuantity: 68,
      newQuantity: 48,
      referenceType: 'TRANSFER',
      referenceId: 'TR-8812',
      reason: 'Stock balancing for Western Maharashtra demand',
      performedBy: 'Amit Verma',
      createdAt: new Date('2026-09-24T10:15:00Z').toISOString()
    },
    {
      _id: 'tx_03',
      type: 'OUT',
      product: 'prod_1001',
      productName: 'Mechanical Ergonomic Keyboard',
      sku: 'P-1001',
      warehouse: 'wh_nagpur',
      warehouseName: 'Nagpur Central Hub',
      quantity: 5,
      previousQuantity: 48,
      newQuantity: 43,
      referenceType: 'SALES_ORDER',
      referenceId: 'SO-2001',
      reason: 'Dispatched to customer ABC Store Enterprises',
      performedBy: 'Amit Verma',
      createdAt: new Date('2026-09-25T11:45:00Z').toISOString()
    }
  ];

  const notifications = [
    {
      _id: 'notif_1',
      title: 'Low Stock Alert',
      message: 'Precision Wireless Mouse (P-1002) is below minimum threshold at Nagpur Central Hub (8 units remaining).',
      type: 'WARNING',
      module: 'INVENTORY',
      link: '/inventory/products',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      _id: 'notif_2',
      title: 'Goods Ready for Inspection',
      message: 'Purchase Order PO-1002 (XYZ Components Corp) is approved and scheduled for receiving at Nagpur.',
      type: 'INFO',
      module: 'PROCUREMENT',
      link: '/procurement/orders',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
      _id: 'notif_3',
      title: 'Payment Received',
      message: 'Payment of ₹25,845 recorded for Invoice INV-2001 via UPI.',
      type: 'SUCCESS',
      module: 'SALES',
      link: '/sales/invoices',
      isRead: true,
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
      _id: 'notif_4',
      title: 'Stock Transfer Completed',
      message: 'Stock transfer of 20x Mechanical Ergonomic Keyboard from Nagpur to Pune completed successfully.',
      type: 'INFO',
      module: 'INVENTORY',
      link: '/inventory/warehouses',
      isRead: true,
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
    }
  ];

  const auditLogs = [
    {
      _id: 'log_1',
      action: 'Approved Purchase Order PO-1002',
      module: 'PROCUREMENT',
      user: 'Rahul Sharma',
      role: 'Admin',
      details: { poNumber: 'PO-1002', supplier: 'XYZ Components Corp', amount: '₹61,360' },
      ipAddress: '192.168.1.101',
      timestamp: new Date('2026-09-26T16:20:00Z').toISOString()
    },
    {
      _id: 'log_2',
      action: 'Stock Transfer: 20x Keyboard Nagpur to Pune',
      module: 'INVENTORY',
      user: 'Amit Verma',
      role: 'Inventory Manager',
      details: { product: 'Mechanical Ergonomic Keyboard', sku: 'P-1001', from: 'Nagpur Central Hub', to: 'Pune Distribution Center', qty: 20 },
      ipAddress: '192.168.1.105',
      timestamp: new Date('2026-09-24T10:15:00Z').toISOString()
    },
    {
      _id: 'log_3',
      action: 'Created Sales Order SO-2002',
      module: 'SALES',
      user: 'Priya Patel',
      role: 'Sales Manager',
      details: { orderNumber: 'SO-2002', customer: 'XYZ Retail Electronics', amount: '₹20,000' },
      ipAddress: '192.168.1.112',
      timestamp: new Date('2026-09-28T15:30:00Z').toISOString()
    },
    {
      _id: 'log_4',
      action: 'Recorded Payment for INV-2001',
      module: 'SALES',
      user: 'Rahul Sharma',
      role: 'Admin',
      details: { invoiceNumber: 'INV-2001', amount: '₹25,845', method: 'UPI' },
      ipAddress: '192.168.1.101',
      timestamp: new Date('2026-09-22T14:00:00Z').toISOString()
    }
  ];

  return {
    users,
    warehouses,
    products,
    inventory,
    suppliers,
    purchaseOrders,
    customers,
    salesOrders,
    invoices,
    stockTransactions,
    notifications,
    auditLogs
  };
};

// In-Memory & Local JSON Store
class DataStore {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.data = getInitialSeed();
        this.save();
      }
    } catch (err) {
      console.error('Error initializing DataStore, using memory fallback:', err);
      this.data = getInitialSeed();
    }
  }

  save() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save to local_db.json:', err);
    }
  }

  reset() {
    this.data = getInitialSeed();
    this.save();
    return this.data;
  }

  collection(name) {
    if (!this.data[name]) {
      this.data[name] = [];
    }
    const list = this.data[name];
    const self = this;

    return {
      find: (filter = {}) => {
        let results = list.filter(item => {
          for (const key of Object.keys(filter)) {
            if (item[key] !== filter[key]) return false;
          }
          return true;
        });
        return {
          sort: (sortCriteria) => {
            const keys = Object.keys(sortCriteria);
            if (keys.length === 0) return results;
            const sortKey = keys[0];
            const direction = sortCriteria[sortKey];
            return [...results].sort((a, b) => {
              const valA = a[sortKey] || '';
              const valB = b[sortKey] || '';
              if (direction === -1) return valB > valA ? 1 : -1;
              return valA > valB ? 1 : -1;
            });
          },
          toArray: () => results,
          exec: async () => results,
          populate: () => results
        };
      },
      findOne: (filter = {}) => {
        const found = list.find(item => {
          for (const key of Object.keys(filter)) {
            if (item[key] !== filter[key]) return false;
          }
          return true;
        });
        return found ? { ...found } : null;
      },
      findById: (id) => {
        const found = list.find(item => item._id === id || item.id === id);
        return found ? { ...found } : null;
      },
      create: (doc) => {
        const newDoc = {
          _id: doc._id || 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          ...doc,
          createdAt: doc.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        list.unshift(newDoc);
        self.save();
        return newDoc;
      },
      findByIdAndUpdate: (id, update, options = {}) => {
        const index = list.findIndex(item => item._id === id || item.id === id);
        if (index === -1) return null;
        list[index] = { ...list[index], ...update, updatedAt: new Date().toISOString() };
        self.save();
        return { ...list[index] };
      },
      findByIdAndDelete: (id) => {
        const index = list.findIndex(item => item._id === id || item.id === id);
        if (index === -1) return null;
        const deleted = list.splice(index, 1)[0];
        self.save();
        return deleted;
      },
      countDocuments: (filter = {}) => {
        if (Object.keys(filter).length === 0) return list.length;
        return list.filter(item => {
          for (const key of Object.keys(filter)) {
            if (item[key] !== filter[key]) return false;
          }
          return true;
        }).length;
      }
    };
  }
}

const dbStore = new DataStore();

module.exports = {
  dbStore,
  getInitialSeed
};
