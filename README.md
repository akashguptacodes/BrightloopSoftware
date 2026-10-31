# Brightloop Subscription Management & Billing System (Odoo Hackathon)

A unified subscription management and recurring billing web platform built for **Brightloop Software**.

## 📁 Project Architecture & Folder Structure

```text
subsManageOdoo/
├── backend/
│   ├── src/
│   │   ├── config/              # PostgreSQL & Cloud Redis configurations
│   │   │   ├── db.js
│   │   │   └── redis.js
│   │   ├── controllers/         # API business logic
│   │   ├── middleware/          # JWT Auth & Role-Based Access Control (RBAC)
│   │   ├── routes/              # Express API endpoints
│   │   ├── services/            # PDF generation (PDFKit), Billing logic
│   │   ├── jobs/                # Recurring billing workers (BullMQ / Redis)
│   │   ├── db/
│   │   │   └── schema.sql       # PostgreSQL tables, relations, and indexes
│   │   ├── app.js               # Express application setup
│   │   └── server.js            # Entry point
│   ├── .env.example             # Database, Redis & JWT env template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/                 # Axios HTTP client with auth interceptors
│   │   ├── components/          # Reusable UI components
│   │   ├── context/             # AuthContext (state management)
│   │   ├── pages/               # Views (Login, Dashboard, Subscriptions, Portal)
│   │   ├── App.jsx              # Main routing & layout
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Tailwind CSS styling
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

## 🛠️ Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Cloud PostgreSQL and Cloud Redis credentials
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

