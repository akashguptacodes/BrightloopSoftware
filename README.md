# Brightloop Software — Subscription Management System
> **Sprint 1, Sprint 2, Sprint 3 & Sprint 4: Commercial Catalog, Quotations, Subscriptions, Invoicing & Automated Recurring Billing**  
> An enterprise-grade, full-stack subscription management and recurring billing platform built for **Brightloop Software**.

---

## 1. Project Overview

Brightloop Software sells cloud software, add-on modules, and physical products across multiple recurring cadences (daily, weekly, monthly, yearly).

- **Sprint 1 (Foundation & Security)**:
  - Role-based authentication (Admin, Staff, Customer) with JWT in HTTP-only cookies and Bearer tokens.
  - Password strength validation and SHA-256 token-based email password reset flow.
  - Admin management of internal staff accounts.
  - Professional SaaS responsive dashboard with Dark Navy sidebar.

- **Sprint 2 (Commercial Foundation)**:
  - **Product Catalog**: Software, Service, and Physical items with base sales and cost pricing.
  - **Variant Engine**: Dynamic attribute price modifiers (e.g. Standard: +₹0, Odoo: +₹560, Enterprise: +₹1,000).
  - **Subscription Plans**: Configurable billing frequencies (Daily, Weekly, Monthly, Yearly), interval multipliers, minimum seat quantities, availability dates, and lifecycle renewal/pause policies.
  - **Tax Configuration**: Percentage-based tax rules (e.g. GST 5%, 12%, 18%) applied post-discount.
  - **Discount Rules Engine**: Fixed and percentage discounts with threshold criteria (minimum quantity, minimum spend, validity range, usage limits) and product-specific or global scope.
  - **Price Calculation Utility**: Decimal-accurate calculation of Unit Price, Subtotal, Eligible Discount, Taxable Amount, Tax, and Final Total.

- **Sprint 3 (Customers, Quotations & Subscriptions)**:
  - **Customer Management**: Profile records, billing/shipping addresses, Tax ID (GSTIN), linked user accounts, sequential `CUST-YYYY-XXXXX` codes.
  - **Quotation Templates**: Reusable presets with standard validity windows, terms & conditions, and closing notes.
  - **Quotation Management**: Sequential `QUO-YYYY-XXXXX` proposals with multi-item builders, live pricing previews, and price snapshot preservation.
  - **Customer Portal**: Self-service portal where customers can review itemized quotes, approve proposals, or decline with feedback.
  - **Quotation-to-Subscription Conversion**: Atomic conversion creating sequential `SUB-YYYY-XXXXX` subscriptions with item snapshots and transitioning quote status to `CONVERTED`.
  - **Subscription Lifecycle Engine**: State machine supporting `PENDING`, `ACTIVE`, `PAUSED`, `CANCELLED`, `CLOSED`, and `RENEWED` with plan policy validation.
  - **Audit Trail History**: Full timeline logging every lifecycle transition with actor identity, action type, and operational notes.
  - **Email Notifications**: Responsive transactional templates for quotation delivery, status updates, and subscription lifecycle changes.

- **Sprint 4 (Invoicing, Payment Management & Automated Recurring Billing)**:
  - **Invoice Management**: Sequential `INV-YYYY-XXXXX` invoices for one-time orders and automated recurring subscription periods.
  - **Live PDF Generation**: Server-side vector PDF creation (`pdfkit`) with company branding, tax breakdown, price snapshots, and payment status stamps.
  - **Manual Payment Recording**: Offline payment reconciliation for Bank Transfers (NEFT/RTGS), UPI, Cash, Cheque, and POS Card with partial payment support.
  - **Razorpay Payment Gateway**: Online checkout flow with cryptographic HMAC-SHA256 signature verification in test/live mode.
  - **Razorpay Webhooks**: Idempotent webhook receiver (`/api/webhooks/razorpay`) with raw body signature verification capturing `payment.captured` and `payment.failed`.
  - **Automated Recurring Billing Scheduler**: In-process `node-cron` worker (00:05 AM daily) with calendar end-of-month clamping and duplicate run protection.
  - **Overdue Scanner**: Daily automated scan (01:00 AM) transitioning unpaid invoices past their due date to `OVERDUE`.
  - **Customer Self-Service Invoicing**: Customer portal to view invoices, download PDFs, and complete payments via integrated Razorpay modal.
  - **Refund Processing**: Full and partial refund management with balance adjustments and audit records.

---

## 2. Technology Stack

### Frontend (`client/`)
- **React.js** (JavaScript, ES Modules)
- **Vite** (Dev server & production bundler)
- **Tailwind CSS** (Clean, professional SaaS styling)
- **React Router DOM v7** (Nested layouts, Protected & Role-based routing)
- **Axios** (Centralized API client with credentials & 401 interceptor)
- **React Context API** (`AuthContext` for global session state)
- **React Hot Toast** (Toast notifications)
- **Lucide React** (Icons)

### Backend (`server/`)
- **Node.js** with **Express.js** (Native ES Modules: `import/export`)
- **Prisma ORM** (Type-safe database modeling & schema migrations)
- **PostgreSQL** (Relational database with strict Decimal financial precision)
- **jsonwebtoken** & **bcryptjs** (Stateless authentication & 10 salt rounds)
- **Nodemailer** (Transactional emails with dev console fallback)
- **Helmet & CORS** (Security headers & credentials support)

---

## 3. Project Folder Structure

```text
subsManageOdoo/
├── client/                                  # React 18 + Vite + Tailwind Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/                      # Reusable layout & route guards
│   │   │   │   ├── Loading.jsx
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── ProtectedRoute.jsx
│   │   │   │   ├── RoleRoute.jsx
│   │   │   │   └── Sidebar.jsx
│   │   │   ├── products/                    # Product components (Sprint 2)
│   │   │   │   ├── ProductForm.jsx
│   │   │   │   ├── ProductTable.jsx
│   │   │   │   └── VariantManager.jsx
│   │   │   ├── plans/                       # Plan components (Sprint 2)
│   │   │   │   ├── PlanForm.jsx
│   │   │   │   └── PlanTable.jsx
│   │   │   ├── taxes/                       # Tax components (Sprint 2)
│   │   │   │   ├── TaxForm.jsx
│   │   │   │   └── TaxTable.jsx
│   │   │   └── discounts/                   # Discount components (Sprint 2)
│   │   │       ├── DiscountForm.jsx
│   │   │       └── DiscountTable.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx              # Global session state & hooks
│   │   ├── layouts/                         # Layout wrappers
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── AuthLayout.jsx
│   │   │   ├── CustomerLayout.jsx
│   │   │   └── StaffLayout.jsx
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx       # Real-time DB metrics & quick actions
│   │   │   │   ├── StaffManagement.jsx      # Staff accounts & toggle status
│   │   │   │   ├── Products.jsx             # Product catalog table & filters
│   │   │   │   ├── ProductDetails.jsx       # Product view & VariantManager
│   │   │   │   ├── Plans.jsx                # Recurring subscription plans
│   │   │   │   ├── PlanDetails.jsx          # Plan specs & policy review
│   │   │   │   ├── Taxes.jsx                # Percentage tax rules
│   │   │   │   └── Discounts.jsx            # Promotional discount rules
│   │   │   ├── auth/
│   │   │   │   ├── ForgotPassword.jsx
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   └── ResetPassword.jsx
│   │   │   ├── customer/
│   │   │   │   └── CustomerDashboard.jsx    # Customer self-service portal
│   │   │   ├── staff/
│   │   │   │   └── StaffDashboard.jsx       # Staff operations hub roadmap
│   │   │   └── NotFound.jsx
│   │   ├── services/                        # Axios API wrappers
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── userService.js
│   │   │   ├── productService.js            # Products & Variants API
│   │   │   ├── planService.js               # Subscription Plans API
│   │   │   ├── taxService.js                # Tax Rules API
│   │   │   ├── discountService.js           # Discount Rules API
│   │   │   └── dashboardService.js          # Aggregated dashboard metrics
│   │   ├── utils/
│   │   │   └── roleHelpers.js
│   │   ├── App.jsx                          # Router configuration
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                                  # Node.js + Express + Prisma Backend
│   ├── prisma/
│   │   ├── schema.prisma                    # PostgreSQL Models (Sprint 1 + Sprint 2)
│   │   └── seed.js                          # Idempotent Admin seeder script
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js                  # Singleton PrismaClient
│   │   │   └── mail.js                      # Nodemailer configuration
│   │   ├── controllers/
│   │   │   ├── authController.js            # Authentication handlers
│   │   │   ├── userController.js            # Staff provisioning
│   │   │   ├── productController.js         # Products & Variants CRUD
│   │   │   ├── planController.js            # Subscription Plans CRUD
│   │   │   ├── taxController.js             # Tax Rules CRUD
│   │   │   ├── discountController.js        # Discount Rules CRUD
│   │   │   └── dashboardController.js       # Real-time metrics
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js            # JWT verification (Cookie & Header)
│   │   │   ├── errorMiddleware.js           # Centralized JSON error handler
│   │   │   └── roleMiddleware.js            # RBAC authorization middleware
│   │   ├── routes/
│   │   │   ├── authRoutes.js                # /api/auth
│   │   │   ├── userRoutes.js                # /api/users
│   │   │   ├── productRoutes.js             # /api/products & /api/variants
│   │   │   ├── planRoutes.js                # /api/plans
│   │   │   ├── taxRoutes.js                 # /api/taxes
│   │   │   ├── discountRoutes.js            # /api/discounts
│   │   │   └── dashboardRoutes.js           # /api/dashboard
│   │   ├── services/
│   │   │   └── emailService.js
│   │   ├── utils/
│   │   │   ├── generateToken.js
│   │   │   ├── passwordValidation.js
│   │   │   ├── discountCalculator.js        # Reusable discount eligibility engine
│   │   │   └── priceCalculator.js           # Reusable financial calculation utility
│   │   ├── app.js                           # Express application
│   │   └── server.js                        # HTTP listener
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 4. Database Models & Schema Extensions (`server/prisma/schema.prisma`)

```prisma
enum Role {
  ADMIN
  STAFF
  CUSTOMER
}

enum ProductType {
  SOFTWARE
  SERVICE
  PHYSICAL
}

enum BillingFrequency {
  DAILY
  WEEKLY
  MONTHLY
  YEARLY
}

enum DiscountType {
  FIXED
  PERCENTAGE
}

model User {
  id             String          @id @default(uuid())
  name           String
  email          String          @unique
  password       String
  role           Role            @default(CUSTOMER)
  isActive       Boolean         @default(true)
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  passwordResets PasswordReset[]
}

model PasswordReset {
  id        String    @id @default(uuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  tokenHash String
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime  @default(now())
}

model Product {
  id          String             @id @default(uuid())
  name        String
  description String?
  type        ProductType        @default(SOFTWARE)
  salesPrice  Decimal            @db.Decimal(12, 2)
  costPrice   Decimal            @db.Decimal(12, 2)
  notes       String?
  isActive    Boolean            @default(true)
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt
  variants    ProductVariant[]
  plans       SubscriptionPlan[]
  discounts   Discount[]
}

model ProductVariant {
  id              String   @id @default(uuid())
  productId       String
  product         Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  name            String
  value           String
  additionalPrice Decimal  @default(0) @db.Decimal(12, 2)
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model SubscriptionPlan {
  id                     String           @id @default(uuid())
  name                   String
  description            String?
  productId              String
  product                Product          @relation(fields: [productId], references: [id], onDelete: Restrict)
  price                  Decimal          @db.Decimal(12, 2)
  billingFrequency       BillingFrequency @default(MONTHLY)
  billingInterval        Int              @default(1)
  minimumQuantity        Int              @default(1)
  availableFrom          DateTime
  availableUntil         DateTime?
  allowRenewal           Boolean          @default(true)
  allowPause             Boolean          @default(false)
  allowEarlyCancellation Boolean          @default(true)
  autoCloseOnExpiry      Boolean          @default(true)
  isActive               Boolean          @default(true)
  createdAt              DateTime         @default(now())
  updatedAt              DateTime         @updatedAt
}

model Tax {
  id          String   @id @default(uuid())
  name        String
  rate        Decimal  @db.Decimal(5, 2)
  description String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Discount {
  id                    String       @id @default(uuid())
  name                  String
  description           String?
  discountType          DiscountType @default(PERCENTAGE)
  discountValue         Decimal      @db.Decimal(12, 2)
  minimumPurchaseAmount Decimal?     @db.Decimal(12, 2)
  minimumQuantity       Int?
  startsAt              DateTime
  expiresAt             DateTime?
  usageLimit            Int?
  usedCount             Int          @default(0)
  isActive              Boolean      @default(true)
  appliesToAllProducts  Boolean      @default(false)
  createdAt             DateTime     @default(now())
  updatedAt             DateTime     @updatedAt
  products              Product[]
}
```

---

## 5. Complete API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` (Public) — Creates customer account.
- `POST /api/auth/login` (Public) — Authenticates & sets HTTP-only cookie.
- `GET /api/auth/me` (Authenticated) — Current profile.
- `POST /api/auth/logout` (Authenticated) — Clears session cookie.
- `POST /api/auth/forgot-password` (Public) — Initiates password reset.
- `POST /api/auth/reset-password` (Public) — Completes password reset atomically.

### User & Staff Management (`/api/users`)
- `POST /api/users/staff` (`ADMIN` only) — Provisions staff account.
- `GET /api/users` (`ADMIN` only) — User directory with `?role=` filter.
- `PATCH /api/users/:id/status` (`ADMIN` only) — Toggles user active status.

### Products (`/api/products`)
- `POST /api/products` (`ADMIN` only) — Create a new product.
- `GET /api/products` (`ADMIN` & `STAFF`) — List products (supports `search`, `type`, `status`, pagination).
- `GET /api/products/:id` (`ADMIN` & `STAFF`) — Get product details with variants and plans.
- `PUT /api/products/:id` (`ADMIN` only) — Update product details.
- `PATCH /api/products/:id/status` (`ADMIN` only) — Activate/deactivate product.
- `DELETE /api/products/:id` (`ADMIN` only) — Safe deletion (blocked if plans exist).

### Product Variants (`/api/products/:productId/variants` & `/api/variants`)
- `POST /api/products/:productId/variants` (`ADMIN` only) — Add variant modifier to a product.
- `GET /api/products/:productId/variants` (`ADMIN` & `STAFF`) — List variants of a product.
- `PUT /api/variants/:id` (`ADMIN` only) — Update variant.
- `PATCH /api/variants/:id/status` (`ADMIN` only) — Toggle variant status.
- `DELETE /api/variants/:id` (`ADMIN` only) — Delete variant.

### Subscription Plans (`/api/plans`)
- `POST /api/plans` (`ADMIN` only) — Create recurring plan (requires active product).
- `GET /api/plans` (`ADMIN` & `STAFF`) — List plans (supports `search`, `productId`, `billingFrequency`, `status`, pagination).
- `GET /api/plans/:id` (`ADMIN` & `STAFF`) — Get plan specification and linked product.
- `PUT /api/plans/:id` (`ADMIN` only) — Update plan.
- `PATCH /api/plans/:id/status` (`ADMIN` only) — Activate/deactivate plan.
- `DELETE /api/plans/:id` (`ADMIN` only) — Delete plan.

### Tax Rules (`/api/taxes`)
- `POST /api/taxes` (`ADMIN` only) — Create percentage tax rule.
- `GET /api/taxes` (`ADMIN` & `STAFF`) — List all tax rules.
- `GET /api/taxes/:id` (`ADMIN` & `STAFF`) — Get tax rule.
- `PUT /api/taxes/:id` (`ADMIN` only) — Update tax rule.
- `PATCH /api/taxes/:id/status` (`ADMIN` only) — Toggle tax rule status.
- `DELETE /api/taxes/:id` (`ADMIN` only) — Delete tax rule.

### Discount Rules (`/api/discounts`)
- `POST /api/discounts` (`ADMIN` only) — Create fixed or percentage discount rule.
- `GET /api/discounts` (`ADMIN` & `STAFF`) — List discounts with linked products.
- `GET /api/discounts/:id` (`ADMIN` & `STAFF`) — Get discount details.
- `PUT /api/discounts/:id` (`ADMIN` only) — Update discount rule.
- `PATCH /api/discounts/:id/status` (`ADMIN` only) — Toggle discount status.
- `DELETE /api/discounts/:id` (`ADMIN` only) — Delete discount rule.

### Dashboard Stats (`/api/dashboard`)
- `GET /api/dashboard/stats` (`ADMIN` & `STAFF`) — Real database counts for products, plans, taxes, discounts, customers, quotations, and subscriptions.

### Customers (`/api/customers`)
- `POST /api/customers` (`ADMIN` & `STAFF`) — Create customer with sequential `CUST-YYYY-XXXXX` code.
- `GET /api/customers` (`ADMIN` & `STAFF`) — List customers with search, status filters, quotation and subscription counts.
- `GET /api/customers/:id` (`ADMIN`, `STAFF`, `CUSTOMER`) — View single customer details and contract history.
- `PUT /api/customers/:id` (`ADMIN` & `STAFF`) — Update customer profile and address.
- `PATCH /api/customers/:id/status` (`ADMIN` & `STAFF`) — Toggle active status.

### Quotation Templates (`/api/quotation-templates`)
- `POST /api/quotation-templates` (`ADMIN` & `STAFF`) — Create standardized preset with validity days and default terms.
- `GET /api/quotation-templates` (`ADMIN` & `STAFF`) — List quotation templates.
- `GET /api/quotation-templates/:id` (`ADMIN` & `STAFF`) — View template details.
- `PUT /api/quotation-templates/:id` (`ADMIN` & `STAFF`) — Update template.
- `PATCH /api/quotation-templates/:id/status` (`ADMIN` & `STAFF`) — Toggle template status.

### Quotations (`/api/quotations`)
- `POST /api/quotations` (`ADMIN` & `STAFF`) — Create quotation draft (`QUO-YYYY-XXXXX`) with line items & snapshots.
- `GET /api/quotations` (`ADMIN` & `STAFF`) — List quotations with status and customer filters.
- `GET /api/quotations/:id` (`ADMIN`, `STAFF`, `CUSTOMER`) — Itemized proposal breakdown with snapshot pricing.
- `PUT /api/quotations/:id` (`ADMIN` & `STAFF`) — Update DRAFT quotation.
- `POST /api/quotations/:id/send` (`ADMIN` & `STAFF`) — Send quotation via email (`SENT`).
- `POST /api/quotations/:id/accept` (`ADMIN` & `STAFF`) — Mark quotation as `ACCEPTED`.
- `POST /api/quotations/:id/reject` (`ADMIN` & `STAFF`) — Mark quotation as `REJECTED`.
- `POST /api/quotations/:id/convert` (`ADMIN` & `STAFF`) — Convert quotation to active subscription (`SUB-YYYY-XXXXX`) and mark quote `CONVERTED`.

### Subscriptions (`/api/subscriptions`)
- `GET /api/subscriptions` (`ADMIN` & `STAFF`) — List subscriptions with status filter (`ACTIVE`, `PAUSED`, `PENDING`, `CANCELLED`, `CLOSED`).
- `GET /api/subscriptions/:id` (`ADMIN`, `STAFF`, `CUSTOMER`) — View subscription details, snapshot items, and audit history.
- `POST /api/subscriptions/:id/activate` (`ADMIN` & `STAFF`) — Activate pending or paused subscription.
- `POST /api/subscriptions/:id/pause` (`ADMIN` & `STAFF`) — Pause subscription (validates plan pause policy).
- `POST /api/subscriptions/:id/resume` (`ADMIN` & `STAFF`) — Resume paused subscription.
- `POST /api/subscriptions/:id/cancel` (`ADMIN` & `STAFF`) — Cancel subscription with reason (validates early cancellation policy).
- `POST /api/subscriptions/:id/renew` (`ADMIN` & `STAFF`) — Renew subscription for next billing cycle.
- `POST /api/subscriptions/:id/close` (`ADMIN` & `STAFF`) — Close subscription contract.
- `GET /api/subscriptions/:id/history` (`ADMIN`, `STAFF`, `CUSTOMER`) — Get complete audit trail.

### Customer Portal (`/api/customer-portal`)
- `GET /api/customer-portal/profile` (`CUSTOMER`) — Customer account profile & stats.
- `GET /api/customer-portal/quotations` (`CUSTOMER`) — Customer's proposals.
- `GET /api/customer-portal/quotations/:id` (`CUSTOMER`) — Review itemized proposal.
- `POST /api/customer-portal/quotations/:id/accept` (`CUSTOMER`) — Customer approves quotation online.
- `POST /api/customer-portal/quotations/:id/reject` (`CUSTOMER`) — Customer declines quotation with feedback.
- `GET /api/customer-portal/subscriptions` (`CUSTOMER`) — Customer's recurring subscriptions.
- `GET /api/customer-portal/subscriptions/:id` (`CUSTOMER`) — Detailed subscription plan and cycle overview.
- `GET /api/customer-portal/invoices` (`CUSTOMER`) — Customer's payable & past invoices.
- `GET /api/customer-portal/invoices/:id` (`CUSTOMER`) — Invoice breakdown & payment receipts.
- `GET /api/customer-portal/invoices/:id/pdf` (`CUSTOMER`) — Stream & download official invoice PDF.
- `GET /api/customer-portal/payments` (`CUSTOMER`) — Customer's ledger payment history.

### Invoices (`/api/invoices`)
- `GET /api/invoices` (`ADMIN` & `STAFF`) — List invoices with status, customer, date filters, and pagination.
- `POST /api/invoices` (`ADMIN` & `STAFF`) — Create manual draft invoice (`INV-YYYY-XXXXX`).
- `GET /api/invoices/:id` (`ADMIN` & `STAFF`) — Full invoice breakdown with line items, snapshots, and payments.
- `PUT /api/invoices/:id` (`ADMIN` & `STAFF`) — Modify DRAFT invoice.
- `POST /api/invoices/:id/issue` (`ADMIN` & `STAFF`) — Issue DRAFT invoice (makes payable and sends email).
- `POST /api/invoices/:id/void` (`ADMIN` & `STAFF`) — Void unpaid invoice.
- `GET /api/invoices/:id/pdf` (`ADMIN` & `STAFF`) — Stream & download generated PDF.

### Payments (`/api/payments`)
- `GET /api/payments` (`ADMIN` & `STAFF`) — List payments with method, status filters, and pagination.
- `POST /api/payments/manual` (`ADMIN` & `STAFF`) — Record manual payment (Bank Transfer, UPI, Cash, Cheque, Card).
- `GET /api/payments/:id` (`ADMIN` & `STAFF`) — View payment details with transaction ref and refund history.
- `POST /api/payments/:id/refund` (`ADMIN`) — Issue refund and adjust invoice balances.
- `POST /api/payments/razorpay/create-order` — Create Razorpay order in paise for checkout.
- `POST /api/payments/razorpay/verify` — Verify HMAC-SHA256 signature and apply payment to invoice.

### Recurring Billing & Automation (`/api/admin/billing`)
- `GET /api/admin/billing/status` (`ADMIN` & `STAFF`) — Scheduler diagnostics, cron schedules, due counts.
- `POST /api/admin/billing/run` (`ADMIN` & `STAFF`) — Trigger manual batch run of recurring billing engine.
- `POST /api/admin/billing/check-overdue` (`ADMIN` & `STAFF`) — Trigger manual scan of overdue invoices.

### Webhooks (`/api/webhooks`)
- `POST /api/webhooks/razorpay` — Public webhook receiver for Razorpay events (`payment.captured`, `payment.failed`) with raw body HMAC verification and idempotency check.

---

## 6. Financial Calculations & Rules Engine

### Price Calculation Formula (`server/src/utils/priceCalculator.js`)
Given:
$$\text{Unit Price} = \text{Base Price} + \text{Variant Additional Price}$$
$$\text{Subtotal} = \text{Unit Price} \times \text{Quantity}$$
$$\text{Taxable Subtotal} = \max(0, \text{Subtotal} - \text{Discount Amount})$$
$$\text{Tax Amount} = \text{Taxable Subtotal} \times \frac{\text{Tax Rate}}{100}$$
$$\text{Final Total} = \text{Taxable Subtotal} + \text{Tax Amount}$$

### Example:
- Base Price: ₹1,000.00
- Variant Additional Price: ₹560.00 (Odoo brand)
- Quantity: 2
- Unit Price: ₹1,560.00
- Subtotal: ₹3,120.00
- Discount: 10% = ₹312.00
- Taxable Subtotal: ₹2,808.00
- Tax (GST 18%): ₹505.44
- **Final Total: ₹3,313.44**

---

## 7. Commands to Run

```bash
# 1. Backend Database Sync & Dev Server
cd server
npm install
npx prisma generate
npx prisma db push
npm run dev

# 2. Frontend Dev Server (in second terminal)
cd client
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.
