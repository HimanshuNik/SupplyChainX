# SupplyChainX 🚀
### Enterprise Multi-Warehouse Inventory, Procurement & Sales Management Platform

> ** Major Project**  
> Built as a production-grade enterprise MERN architecture featuring a closed-loop business workflow rather than disconnected CRUD pages.

---

## 🌟 The Interconnected Business Story  

Traditional student projects show isolated tables. **SupplyChainX** demonstrates a real enterprise state machine where every action cascades across departments:

```
                          SUPPLYCHAINX ENTERPRISE
                                     │
                     ┌───────────────┼────────────────┐
                     ↓               ↓                ↓
                PROCUREMENT      INVENTORY          SALES
                     │               │                │
                 Suppliers       Products         Customers
                     │               │                │
              Purchase Orders    Warehouses       Sales Orders
                     │               │                │
             Goods Receiving   Stock Transfer    Tax Invoices
                     │               │                │
                     └───────────────┼────────────────┘
                                     ↓
                                 ANALYTICS
                                     ↓
                              EXECUTIVE AUDIT
```

### Complete End-to-End Workflow:
1. **Purchase Manager** creates a Purchase Order (`PO-1002`) for 50 Keyboards & 30 Mice from *XYZ Components Corp* bound for *Nagpur Central Hub*.
2. **Admin** approves the Purchase Order.
3. **Goods Receiving**: Warehouse inspection verifies incoming physical units. Confirming receipt:
   - Automatically increments stock in **Nagpur Hub**.
   - Records an immutable `IN` transaction in the stock ledger.
   - Generates notifications for inventory managers.
4. **Stock Transfer**: 20 Keyboards transferred from *Nagpur Central Hub* to *Pune Distribution Center* with atomic source deduction and destination credit.
5. **Sales Manager** creates a Sales Order for *ABC Store Enterprises*:
   - Validates that requested quantity **does not exceed available stock**.
   - Deducts stock immediately from the dispatch warehouse.
   - Records an immutable `OUT` transaction in the ledger.
   - Automatically issues a GST-compliant **Tax Invoice** (`INV-2001`).
6. **Invoicing & Payments**:
   - Client-side downloadable & printable PDF invoices via `jsPDF`.
   - Recording payments (UPI, Bank Transfer, Card) updates balances and marks status as `Paid`.
7. **Analytics & Audit Trail**:
   - Executive dashboard graphs (Recharts) reflect revenue and stock distributions.
   - Tamper-proof audit logs record every event with actor, timestamp, IP, and raw delta payload.

---

## 💻 Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router v6 |
| **Design System** | Tailwind CSS v3, Lucide Icons, Custom Scrollbars & Glassmorphism |
| **Typography** | Inter (Google Fonts) |
| **Charts** | Recharts (Responsive Area, Bar, and Line charts) |
| **Documents / PDF**| jsPDF, jsPDF-autotable (Client-side vector invoices & reports) |
| **Backend** | Node.js, Express.js REST API, Morgan |
| **Data Layer** | Dual-mode: MongoDB Mongoose + Zero-Config Embedded JSON Store (runs out of the box offline or connects to MongoDB Atlas) |
| **Authentication** | JWT (JSON Web Tokens), Bcrypt.js password hashing |
| **Security & RBAC** | Role-Based Access Control (Admin, Inventory, Purchase, Sales) |

---

## 👥 1-Click Demo Accounts (Viva Presentation)

The login screen features 1-click preset credentials for easy live presentations:

| Role | Name | Email | Password | Scope & Permissions |
|---|---|---|---|---|
| **Admin** | Rahul Sharma | `admin@supplychainx.com` | `admin123` | Full system control, PO approvals, user management, audit logs |
| **Inventory Manager** | Amit Verma | `amit@supplychainx.com` | `manager123` | Warehouses, catalog, inter-warehouse stock transfers, adjustments |
| **Purchase Manager** | Vikram Singh | `vikram@supplychainx.com` | `purchase123` | Supplier directory, PO creation, goods receiving inspection |
| **Sales Manager** | Priya Patel | `priya@supplychainx.com` | `sales123` | Customer accounts, sales orders, invoice generation, payments |

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
# In backend
cd backend
npm install

# In frontend
cd ../frontend
npm install
```

### 2. Start Backend & Frontend
Open two terminal windows:

**Terminal 1 (Backend API):**
```bash
cd backend
npm start
# Running on http://localhost:5000/api
```

**Terminal 2 (Frontend Client):**
```bash
cd frontend
npm run dev
# Running on http://localhost:5173
```

> **Note on Database**: SupplyChainX includes an embedded data repository that pre-populates realistic enterprise data immediately. You can run the entire project **without needing local MongoDB installed**. To connect to MongoDB Atlas, simply provide your `MONGO_URI` in `backend/.env`.

---

## 📂 Project Structure

```
SupplyChainX/
├── backend/
│   ├── config/
│   │   └── db.js                 # Dual-mode DB connector (MongoDB Atlas + Fast JSON fallback)
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js  # Multi-warehouse stock calculations
│   │   ├── warehouseController.js
│   │   ├── inventoryController.js# Inter-warehouse atomic transfer & adjustments
│   │   ├── supplierController.js
│   │   ├── purchaseOrderController.js # PO approval & Goods Receiving flow
│   │   ├── customerController.js
│   │   ├── salesOrderController.js    # Stock validation & auto-invoicing
│   │   ├── invoiceController.js       # Payment recording & reconciliations
│   │   ├── analyticsController.js     # KPIs, Recharts datasets, and reports
│   │   ├── notificationController.js
│   │   ├── userController.js
│   │   └── auditLogController.js
│   ├── models/                   # Complete Mongoose Schemas (User, Product, Warehouse, Inventory, etc.)
│   ├── routes/                   # Express REST Route Handlers
│   ├── utils/
│   │   ├── dbStore.js            # Persistence engine & initial seed data
│   │   └── auditLogger.js        # Event logging utility
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosClient.js    # JWT injector & error handling
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # RBAC & persona switcher
│   │   │   └── NotificationContext.jsx # Real-time alerts
│   │   ├── components/
│   │   │   ├── common/           # Button, Input, Select, Modal, Badge, Card, Table, Toast, Tabs, etc.
│   │   │   └── layout/           # Navbar, Sidebar, DashboardLayout, PublicNavbar, PublicFooter
│   │   ├── pages/
│   │   │   ├── public/           # LandingPage, FeaturesPage, AboutPage, ContactPage
│   │   │   ├── auth/             # LoginPage, RegisterPage
│   │   │   ├── dashboard/        # DashboardPage (KPIs, Charts, Alerts)
│   │   │   ├── inventory/        # ProductsPage, WarehousesPage, StockTransactionsPage
│   │   │   ├── procurement/      # SuppliersPage, PurchaseOrdersPage, GoodsReceiving
│   │   │   ├── sales/            # CustomersPage, SalesOrdersPage, InvoicesPage, InvoiceDetailPage
│   │   │   ├── analytics/        # AnalyticsPage (Revenue trendlines, Top products)
│   │   │   ├── reports/          # ReportsPage (CSV & PDF exports)
│   │   │   ├── users/            # UsersPage (RBAC management)
│   │   │   ├── audit/            # AuditLogPage (Event inspection)
│   │   │   └── settings/         # SettingsPage (Company, GSTIN, Profile)
│   │   └── utils/
│   │       ├── formatters.js     # Currency (INR ₹) & date formatters
│   │       └── pdfGenerator.js   # jsPDF vector tax invoice & reports engine
│   ├── tailwind.config.js
│   └── vite.config.js
└── package.json
```

---

## 🎓 College Viva Presentation Flow

To impress examiners and professors, demonstrate this exact storyline:
1. **Public Landing Page** (`/`): Show the professional corporate landing page and architecture diagram.
2. **One-Click Login** (`/login`): Select **Admin (Rahul Sharma)** or **Inventory Manager**.
3. **Multi-Warehouse Inventory** (`/inventory/products`): Show *Mechanical Keyboard* stock distributed across Nagpur (48), Pune (18), and Mumbai (10).
4. **Stock Transfer** (`/inventory/warehouses`): Transfer 20 units of Keyboards from Nagpur to Pune. Watch Nagpur drop from 48 to 28 and Pune rise from 18 to 38.
5. **Procurement & Goods Receiving** (`/procurement/orders`): Open `PO-1002`, click **Receive Goods**, enter inspected quantities, and verify that physical inventory increases automatically.
6. **Sales Order Creation** (`/sales/orders`): Create a new order for *ABC Store*. Notice how available stock in the selected hub is validated in real-time, preventing overselling.
7. **Invoice & PDF Download** (`/sales/invoices`): View the newly generated Tax Invoice, click **Download PDF** for a vector jsPDF invoice, and record a payment via UPI.
8. **Audit Trail Verification** (`/audit-logs`): Open the immutable audit log and show the professor that every single step has been recorded with user, timestamp, and IP address.
