# Brightloop Software — Subscription Management System
> **Sprint 1: Project Foundation & Authentication**  
> An enterprise-grade, full-stack subscription management and recurring billing platform built for **Brightloop Software**.

---

## 1. Project Introduction

Brightloop Software sells cloud software, add-on modules, and product variants across multiple billing cadences (monthly, yearly, etc.).  
**Sprint 1** establishes the core foundation:
- Secure, role-based authentication (Admin, Staff, Customer).
- Strict password strength enforcement.
- Stateless JWT authentication delivered via HTTP-only cookies and Bearer tokens.
- Cryptographically secure, SHA-256 hashed password reset flow via email (with local dev fallback).
- Admin management of internal staff accounts and access control.
- Modern, responsive SaaS user interface built with React, Vite, and Tailwind CSS.

---

## 2. Technology Stack

### Frontend (`client/`)
- **React.js** (JavaScript, ES Modules)
- **Vite** (Next-generation dev server and bundler)
- **Tailwind CSS** (Clean, professional SaaS styling)
- **React Router DOM v7** (Nested routes, layout routing, Protected & Role-based routes)
- **Axios** (Centralized API client with interceptors and HTTP-only cookie support)
- **React Context API** (`AuthContext` for global session state management)
- **React Hot Toast** (User-friendly toast notifications)
- **Lucide React** (Clean, modern SVG iconography)

### Backend (`server/`)
- **Node.js** with **Express.js** (Native ES Modules: `import/export`)
- **Prisma ORM** (Type-safe database modeling and migrations)
- **PostgreSQL** (Relational integrity for accounts and tokens)
- **JSON Web Tokens (`jsonwebtoken`)** (Stateless authentication)
- **bcryptjs** (10 salt rounds for password hashing)
- **Nodemailer** (Transactional emails for password recovery)
- **Helmet & CORS** (Security headers and cross-origin resource sharing)
- **express-rate-limit** (Brute-force protection on auth endpoints)

---

## 3. Project Folder Structure

```text
subsManageOdoo/
├── client/                              # Frontend React + Vite Application
│   ├── public/
│   ├── src/
│   │   ├── components/common/           # Reusable components
│   │   │   ├── Loading.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── RoleRoute.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx          # Session state & auth hooks
│   │   ├── layouts/                     # Route layout wrappers
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── AuthLayout.jsx
│   │   │   ├── CustomerLayout.jsx
│   │   │   └── StaffLayout.jsx
│   │   ├── pages/                       # Screen views
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   └── StaffManagement.jsx
│   │   │   ├── auth/
│   │   │   │   ├── ForgotPassword.jsx
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   └── ResetPassword.jsx
│   │   │   ├── customer/
│   │   │   │   └── CustomerDashboard.jsx
│   │   │   ├── staff/
│   │   │   │   └── StaffDashboard.jsx
│   │   │   └── NotFound.jsx
│   │   ├── services/
│   │   │   ├── api.js                   # Axios instance
│   │   │   ├── authService.js           # Auth endpoint wrappers
│   │   │   └── userService.js           # Staff management API wrappers
│   │   ├── utils/
│   │   │   └── roleHelpers.js           # Role enum & redirect helpers
│   │   ├── App.jsx                      # App router configuration
│   │   ├── index.css                    # Tailwind CSS imports
│   │   └── main.jsx                     # Vite React entry point
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                              # Backend Node.js + Express + Prisma API
│   ├── prisma/
│   │   ├── schema.prisma                # User & PasswordReset models
│   │   └── seed.js                      # Idempotent Admin account seed script
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js              # Singleton PrismaClient
│   │   │   └── mail.js                  # Nodemailer transporter
│   │   ├── controllers/
│   │   │   ├── authController.js        # Auth logic (register, login, reset)
│   │   │   └── userController.js        # Staff creation & management
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js        # JWT verification (Cookie & Header)
│   │   │   ├── errorMiddleware.js       # Centralized error handler
│   │   │   └── roleMiddleware.js        # RBAC authorization guard
│   │   ├── routes/
│   │   │   ├── authRoutes.js            # /api/auth routes with rate limiting
│   │   │   └── userRoutes.js            # /api/users routes (Admin guarded)
│   │   ├── services/
│   │   │   └── emailService.js          # Password reset email delivery
│   │   ├── utils/
│   │   │   ├── generateToken.js         # JWT & crypto SHA-256 token helper
│   │   │   └── passwordValidation.js    # Password complexity validator
│   │   ├── app.js                       # Express app configuration
│   │   └── server.js                    # Server startup & env validation
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 4. Prerequisites

Before running the project, ensure you have:
- **Node.js**: v18.0.0 or later (v22 recommended)
- **npm**: v9.0.0 or later
- **PostgreSQL**: A running instance (local PostgreSQL or Cloud Postgres like Neon, Supabase, Render, or Railway)

---

## 5. Environment Variable Configuration

### Backend (`server/.env`)
Copy `server/.env.example` to `server/.env`:
```bash
cp server/.env.example server/.env
```
Populate the values:
```env
PORT=5000
NODE_ENV=development

# Cloud or Local PostgreSQL Connection URL
DATABASE_URL=postgresql://postgres:password@localhost:5432/subscription_management?sslmode=prefer

# JWT Configuration
JWT_SECRET=brightloop_super_secret_jwt_key_min_32_characters_long!
JWT_EXPIRES_IN=1d

# Frontend URL (For CORS & Password Reset Links)
FRONTEND_URL=http://localhost:5173

# SMTP Configuration (Optional in development; reset links are printed to console if empty)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@brightloop.com

# Initial Admin Seeder Credentials
ADMIN_EMAIL=admin@brightloop.com
ADMIN_PASSWORD=Admin@12345
ADMIN_NAME=System Admin
```

### Frontend (`client/.env`)
Copy `client/.env.example` to `client/.env`:
```bash
cp client/.env.example client/.env
```
Populate the values:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 6. Installation & Database Setup

### Step 1: Install Backend Dependencies & Run Migrations
```bash
cd server
npm install

# Generate Prisma Client & Run Database Migration
npx prisma migrate dev --name init_users_and_resets

# Seed the initial Admin Account
npm run db:seed
```

### Step 2: Install Frontend Dependencies
```bash
cd ../client
npm install
```

---

## 7. Running the Application

Open two terminal tabs:

### Terminal 1: Backend Server (Port 5000)
```bash
cd server
npm run dev
```
*The backend starts at `http://localhost:5000` with nodemon auto-reloading.*

### Terminal 2: Frontend Client (Port 5173)
```bash
cd client
npm run dev
```
*Open `http://localhost:5173` in your browser.*

---

## 8. Creating the Initial Admin Account

Public registration (`/register`) **strictly assigns the CUSTOMER role** and never permits role selection.

To create the initial Admin account securely, run the idempotent seeder:
```bash
cd server
npm run db:seed
```
- Reads `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME` from your `server/.env`.
- Checks if the admin account already exists.
- If it does not exist, it creates the admin with `role: ADMIN`.
- If it already exists, it skips without modifying or corrupting the existing admin password.

**Default Initial Admin Credentials:**
- **Email:** `admin@brightloop.com`
- **Password:** `Admin@12345`

---

## 9. Available API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new customer account (CUSTOMER role only) |
| `POST` | `/api/auth/login` | Public | Authenticate user, set HTTP-only cookie & return JWT (Rate limited: 5 attempts/15m) |
| `GET` | `/api/auth/me` | Authenticated | Fetch current logged-in user profile (excludes password) |
| `POST` | `/api/auth/logout` | Authenticated | Clear HTTP-only session cookie |
| `POST` | `/api/auth/forgot-password` | Public | Send 15-minute SHA-256 hashed reset token via email (Rate limited: 3 attempts/15m) |
| `POST` | `/api/auth/reset-password` | Public | Validate token & update password atomically via Prisma transaction |

### User & Staff Management (`/api/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/users/staff` | **ADMIN Only** | Create an internal staff account with `STAFF` role |
| `GET` | `/api/users` | **ADMIN Only** | List all users (supports `?role=STAFF` or `?role=CUSTOMER` filters) |
| `PATCH`| `/api/users/:id/status` | **ADMIN Only** | Activate or deactivate staff accounts (cannot deactivate self) |

### Health Check
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Service health & timestamp status |

---

## 10. Role-Based Access Control (RBAC) Rules

| User Role | Permitted Routes & Capabilities |
| :--- | :--- |
| **`ADMIN`** | Full access to `/admin/dashboard`, `/admin/staff` (create staff, toggle status), `/staff/dashboard`, and future billing administration. |
| **`STAFF`** | Access to `/staff/dashboard` (operations hub) and day-to-day workflow actions. Blocked from `/admin/*`. |
| **`CUSTOMER`** | Access only to `/customer/dashboard` (self-service portal). Strictly blocked from all internal dashboards. |

---

## 11. Security & Validation Highlights

1. **Password Policy**: Enforces $>8$ characters, at least 1 uppercase letter, 1 lowercase letter, and 1 special character.
2. **Password Hashing**: `bcryptjs` with 10 salt rounds. Plaintext passwords are never stored.
3. **Reset Token Security**: Reset tokens are generated with `crypto.randomBytes(32)` and only their SHA-256 hash is saved in the database.
4. **Prisma Transactions**: Token verification, password update, and invalidation of other active reset tokens for that user happen atomically in a single transaction.
5. **Rate Limiting**: Protects login and password reset routes against credential stuffing and brute-force attacks.
6. **No Email Enumeration**: `/forgot-password` always returns a generic success response regardless of whether the email exists.
7. **HTTP-only Cookies**: JWTs are transmitted in secure, HTTP-only, `sameSite: lax` cookies preventing XSS token theft.

