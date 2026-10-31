# Brightloop Software — Subscription Management System
> **Sprint 1 & Sprint 2: Commercial Catalog, Plans, Taxes, Discounts & Authentication**  
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
  - **Role Separation**: Admins manage configurations; Staff have read-only catalog browsing.

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
- `GET /api/dashboard/stats` (`ADMIN` & `STAFF`) — Real database counts for products, plans, taxes, discounts, staff, and customers.

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
