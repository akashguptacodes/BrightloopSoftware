-- Database Schema for Brightloop Subscription Management System

-- 1. Users & RBAC
CREATE TYPE user_role AS ENUM ('admin', 'staff', 'customer');

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'customer',
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Products & Variants
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) DEFAULT 'software', -- software, service, add-on
    sales_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_variants (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    attribute_name VARCHAR(100) NOT NULL, -- e.g. 'Brand'
    attribute_value VARCHAR(100) NOT NULL, -- e.g. 'Odoo'
    price_modifier NUMERIC(12, 2) DEFAULT 0.00, -- e.g. +560.00
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Subscription Plans & Policies
CREATE TYPE billing_interval AS ENUM ('daily', 'weekly', 'monthly', 'yearly');

CREATE TABLE IF NOT EXISTS plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cost NUMERIC(12, 2) NOT NULL,
    billing_frequency billing_interval NOT NULL DEFAULT 'monthly',
    min_quantity INT NOT NULL DEFAULT 1,
    start_date DATE,
    end_date DATE,
    auto_close_on_expiry BOOLEAN DEFAULT FALSE,
    can_pause BOOLEAN DEFAULT TRUE,
    can_renew BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Taxes & Discounts
CREATE TABLE IF NOT EXISTS tax_rules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- e.g. 'GST 18%'
    rate NUMERIC(5, 2) NOT NULL, -- percentage, e.g. 18.00
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE discount_type AS ENUM ('percentage', 'fixed');

CREATE TABLE IF NOT EXISTS discount_rules (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type discount_type NOT NULL DEFAULT 'percentage',
    value NUMERIC(12, 2) NOT NULL,
    min_purchase_amount NUMERIC(12, 2) DEFAULT 0.00,
    min_quantity INT DEFAULT 1,
    start_date DATE,
    end_date DATE,
    max_usage_limit INT DEFAULT NULL,
    usage_count INT DEFAULT 0,
    apply_to_product_id INT REFERENCES products(id) ON DELETE SET NULL, -- NULL means entire subscription
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Subscriptions & Quotation Templates
CREATE TYPE subscription_status AS ENUM ('draft', 'quotation', 'confirmed', 'active', 'paused', 'closed');

CREATE TABLE IF NOT EXISTS quotation_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    plan_id INT REFERENCES plans(id) ON DELETE SET NULL,
    validity_days INT DEFAULT 30,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    subscription_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. SUB-2026-0001
    customer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id INT NOT NULL REFERENCES plans(id),
    status subscription_status NOT NULL DEFAULT 'draft',
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE,
    next_billing_date DATE,
    payment_terms VARCHAR(100) DEFAULT 'Due on receipt',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscription_lines (
    id SERIAL PRIMARY KEY,
    subscription_id INT NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id),
    variant_id INT REFERENCES product_variants(id) ON DELETE SET NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL,
    tax_rate NUMERIC(5, 2) DEFAULT 0.00,
    line_total NUMERIC(12, 2) NOT NULL
);

-- 6. Invoices & Billing
CREATE TYPE invoice_status AS ENUM ('draft', 'confirmed', 'paid', 'cancelled');

CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. INV-2026-0001
    subscription_id INT REFERENCES subscriptions(id) ON DELETE SET NULL,
    customer_id INT NOT NULL REFERENCES users(id),
    billing_period_start DATE,
    billing_period_end DATE,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    status invoice_status NOT NULL DEFAULT 'draft',
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tax_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoice_lines (
    id SERIAL PRIMARY KEY,
    invoice_id INT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    description VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL,
    tax_rate NUMERIC(5, 2) DEFAULT 0.00,
    discount_amount NUMERIC(12, 2) DEFAULT 0.00,
    line_total NUMERIC(12, 2) NOT NULL
);

-- 7. Payments
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    invoice_id INT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- 'Card', 'Bank Transfer', 'Stripe', etc.
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Indexes for Fast Querying (<2 seconds requirement)
CREATE INDEX IF NOT EXISTS idx_subs_customer_id ON subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_subs_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subs_next_billing ON subscriptions(next_billing_date);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);

