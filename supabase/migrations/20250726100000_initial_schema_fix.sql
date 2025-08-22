-- =================================================================
-- Millennium Potter - Initial Database Schema (Corrected)
-- Version: 1.1
-- Description: Fixes VARCHAR length issues for phone and bank account numbers.
-- This script is idempotent and can be run on a fresh or partially migrated database.
-- =================================================================

-- Drop existing objects in reverse order to handle dependencies
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS weekly_payment_tracking CASCADE;
DROP TABLE IF EXISTS daily_payments CASCADE;
DROP TABLE IF EXISTS loan_applications CASCADE;
DROP TABLE IF EXISTS loan_products CASCADE;
DROP TABLE IF EXISTS guarantors CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS branches CASCADE;

DROP FUNCTION IF EXISTS assign_agent_to_branch_admin() CASCADE;
DROP FUNCTION IF EXISTS create_weekly_payment_schedule(UUID, UUID, UUID, UUID, DATE, INTEGER) CASCADE;


-- =================================================================
-- Table Creation
-- =================================================================

-- Branches Table
CREATE TABLE branches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    address TEXT,
    phone VARCHAR(30), -- Corrected from VARCHAR(20)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE "branches" IS 'Stores information about different microfinance branches.';

-- Users Table (Admin, Sub-Admin, Agent)
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(30), -- Corrected from VARCHAR(20)
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'sub_admin', 'agent')),
    branch_id UUID REFERENCES branches(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);
COMMENT ON TABLE "users" IS 'Stores user profiles, linking to Supabase auth.users.';

-- Customers Table (No login access)
CREATE TABLE customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL, -- Corrected from VARCHAR(20)
    email VARCHAR(255),
    date_of_birth DATE,
    address TEXT NOT NULL,
    occupation VARCHAR(100),
    monthly_income DECIMAL(15,2),
    bank_name VARCHAR(100),
    bank_account VARCHAR(30), -- Corrected from VARCHAR(20)
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(30), -- Corrected from VARCHAR(20)
    branch_id UUID REFERENCES branches(id) NOT NULL,
    agent_id UUID REFERENCES users(id) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE "customers" IS 'Stores customer information, managed by agents.';

-- Guarantors Table
CREATE TABLE guarantors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('primary', 'secondary')),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL, -- Corrected from VARCHAR(20)
    address TEXT NOT NULL,
    occupation VARCHAR(100),
    monthly_income DECIMAL(15,2),
    relationship_to_customer VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE "guarantors" IS 'Stores guarantor information for customers.';

-- Loan Products Table
CREATE TABLE loan_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    principal_amount DECIMAL(15,2) NOT NULL,
    daily_payment DECIMAL(15,2) NOT NULL,
    duration_days INTEGER NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE "loan_products" IS 'Defines the available loan products.';

-- Loan Applications Table
CREATE TABLE loan_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) NOT NULL,
    loan_product_id UUID REFERENCES loan_products(id) NOT NULL,
    agent_id UUID REFERENCES users(id) NOT NULL,
    branch_id UUID REFERENCES branches(id) NOT NULL,
    application_date DATE DEFAULT CURRENT_DATE,
    purpose TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'disbursed')),
    approved_by UUID REFERENCES users(id),
    approval_date DATE,
    rejection_reason TEXT,
    disbursement_date DATE,
    start_date DATE,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE "loan_applications" IS 'Tracks all loan applications.';

-- Daily Payment Records Table
CREATE TABLE daily_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    loan_application_id UUID REFERENCES loan_applications(id) NOT NULL,
    customer_id UUID REFERENCES customers(id) NOT NULL,
    agent_id UUID REFERENCES users(id) NOT NULL,
    branch_id UUID REFERENCES branches(id) NOT NULL,
    payment_date DATE NOT NULL,
    expected_amount DECIMAL(15,2) NOT NULL,
    actual_amount DECIMAL(15,2),
    payment_method VARCHAR(50),
    is_paid BOOLEAN DEFAULT false,
    payment_time TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(loan_application_id, payment_date)
);
COMMENT ON TABLE "daily_payments" IS 'Records individual daily payments for loans.';

-- Weekly Payment Tracking (Monday to Saturday)
CREATE TABLE weekly_payment_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    loan_application_id UUID REFERENCES loan_applications(id) NOT NULL,
    customer_id UUID REFERENCES customers(id) NOT NULL,
    agent_id UUID REFERENCES users(id) NOT NULL,
    branch_id UUID REFERENCES branches(id) NOT NULL,
    week_start DATE NOT NULL,
    monday_paid BOOLEAN DEFAULT false,
    tuesday_paid BOOLEAN DEFAULT false,
    wednesday_paid BOOLEAN DEFAULT false,
    thursday_paid BOOLEAN DEFAULT false,
    friday_paid BOOLEAN DEFAULT false,
    saturday_paid BOOLEAN DEFAULT false,
    monday_amount DECIMAL(15,2),
    tuesday_amount DECIMAL(15,2),
    wednesday_amount DECIMAL(15,2),
    thursday_amount DECIMAL(15,2),
    friday_amount DECIMAL(15,2),
    saturday_amount DECIMAL(15,2),
    total_week_amount DECIMAL(15,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(loan_application_id, week_start)
);
COMMENT ON TABLE "weekly_payment_tracking" IS 'Aggregates weekly payment status for easy tracking.';

-- Transactions Table
CREATE TABLE transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    loan_application_id UUID REFERENCES loan_applications(id),
    customer_id UUID REFERENCES customers(id) NOT NULL,
    agent_id UUID REFERENCES users(id) NOT NULL,
    branch_id UUID REFERENCES branches(id) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('loan_disbursement', 'daily_payment', 'penalty', 'refund')),
    amount DECIMAL(15,2) NOT NULL,
    transaction_date DATE DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50),
    reference_number VARCHAR(100),
    description TEXT,
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE "transactions" IS 'A log of all financial transactions.';

-- Audit Log Table
CREATE TABLE audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE "audit_logs" IS 'Logs significant actions performed by users for auditing purposes.';

-- =================================================================
-- Initial Data Seeding
-- =================================================================

-- Insert Default Branches
INSERT INTO branches (name, code, address, phone) VALUES 
('Igando Branch', 'IGD', 'Igando, Lagos, Nigeria', '+234 (0) 803 123 4567'),
('Abule-Egba Branch', 'AEB', 'Abule-Egba, Lagos, Nigeria', '+234 (0) 803 765 4321');

-- Insert Loan Products
INSERT INTO loan_products (name, principal_amount, daily_payment, duration_days, total_amount) VALUES
('₦30K Loan', 30000.00, 1500.00, 30, 45000.00),
('₦40K Loan', 40000.00, 2000.00, 25, 50000.00),
('₦50K Loan', 50000.00, 2500.00, 25, 62500.00),
('₦60K Loan', 60000.00, 3000.00, 25, 75000.00),
('₦80K Loan', 80000.00, 4000.00, 25, 100000.00),
('₦100K Loan', 100000.00, 5000.00, 25, 125000.00),
('₦150K Loan', 150000.00, 7500.00, 25, 187500.00),
('₦200K Loan', 200000.00, 10000.00, 25, 250000.00);


-- =================================================================
-- Indexes for Performance
-- =================================================================

CREATE INDEX idx_users_branch_role ON users(branch_id, role);
CREATE INDEX idx_customers_branch_agent ON customers(branch_id, agent_id);
CREATE INDEX idx_loan_applications_status ON loan_applications(status, branch_id);
CREATE INDEX idx_daily_payments_date ON daily_payments(payment_date, branch_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date, branch_id);
CREATE INDEX idx_weekly_tracking_week ON weekly_payment_tracking(week_start, agent_id);
CREATE INDEX idx_users_auth_id ON users(auth_id);

-- =================================================================
-- Row Level Security (RLS)
-- =================================================================

-- Enable RLS on all relevant tables
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_payment_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE guarantors ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to branches and loan products
CREATE POLICY "Allow public read access to branches" ON branches FOR SELECT USING (true);
CREATE POLICY "Allow public read access to loan products" ON loan_products FOR SELECT USING (true);

-- Function to get the branch_id of the currently authenticated user
CREATE OR REPLACE FUNCTION get_my_branch_id()
RETURNS UUID AS $$
DECLARE
  branch_uuid UUID;
BEGIN
  SELECT branch_id INTO branch_uuid
  FROM public.users
  WHERE auth_id = auth.uid()
  LIMIT 1;
  RETURN branch_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get the role of the currently authenticated user
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.users
  WHERE auth_id = auth.uid()
  LIMIT 1;
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for 'users' table
CREATE POLICY "Admins can manage all users" ON users FOR ALL
  USING (get_my_role() = 'admin');
CREATE POLICY "Sub-admins can manage users in their branch" ON users FOR ALL
  USING (get_my_role() = 'sub_admin' AND branch_id = get_my_branch_id());
CREATE POLICY "Users can view their own profile" ON users FOR SELECT
  USING (auth_id = auth.uid());
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE
  USING (auth_id = auth.uid());

-- RLS Policies for 'customers' table
CREATE POLICY "Admins can manage all customers" ON customers FOR ALL
  USING (get_my_role() = 'admin');
CREATE POLICY "Sub-admins can manage customers in their branch" ON customers FOR ALL
  USING (get_my_role() = 'sub_admin' AND branch_id = get_my_branch_id());
CREATE POLICY "Agents can manage their own customers" ON customers FOR ALL
  USING (get_my_role() = 'agent' AND agent_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Apply similar logic to other tables...
CREATE POLICY "Branch-level access for loan_applications" ON loan_applications FOR ALL
  USING (
    get_my_role() = 'admin' OR
    (get_my_role() = 'sub_admin' AND branch_id = get_my_branch_id()) OR
    (get_my_role() = 'agent' AND agent_id = (SELECT id FROM users WHERE auth_id = auth.uid()))
  );

CREATE POLICY "Branch-level access for daily_payments" ON daily_payments FOR ALL
  USING (
    get_my_role() = 'admin' OR
    (get_my_role() = 'sub_admin' AND branch_id = get_my_branch_id()) OR
    (get_my_role() = 'agent' AND agent_id = (SELECT id FROM users WHERE auth_id = auth.uid()))
  );

CREATE POLICY "Branch-level access for weekly_tracking" ON weekly_payment_tracking FOR ALL
  USING (
    get_my_role() = 'admin' OR
    (get_my_role() = 'sub_admin' AND branch_id = get_my_branch_id()) OR
    (get_my_role() = 'agent' AND agent_id = (SELECT id FROM users WHERE auth_id = auth.uid()))
  );

CREATE POLICY "Branch-level access for transactions" ON transactions FOR ALL
  USING (
    get_my_role() = 'admin' OR
    (get_my_role() = 'sub_admin' AND branch_id = get_my_branch_id()) OR
    (get_my_role() = 'agent' AND agent_id = (SELECT id FROM users WHERE auth_id = auth.uid()))
  );

-- =================================================================
-- Database Functions & Triggers
-- =================================================================

-- Function to automatically assign agents to branch admin
CREATE OR REPLACE FUNCTION assign_agent_to_branch_admin()
RETURNS TRIGGER AS $$
BEGIN
    -- When an agent is created, ensure they're linked to their branch
    IF NEW.role = 'agent' AND NEW.branch_id IS NOT NULL THEN
        -- Update created_by to branch sub_admin if not set
        IF NEW.created_by IS NULL THEN
            NEW.created_by := (
                SELECT id FROM users 
                WHERE branch_id = NEW.branch_id 
                AND role = 'sub_admin' 
                LIMIT 1
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_assign_agent_to_branch_admin
    BEFORE INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION assign_agent_to_branch_admin();

-- Function to create weekly payment schedule
CREATE OR REPLACE FUNCTION create_weekly_payment_schedule(
    p_loan_application_id UUID,
    p_customer_id UUID,
    p_agent_id UUID,
    p_branch_id UUID,
    p_start_date DATE,
    p_duration_days INTEGER
)
RETURNS VOID AS $$
DECLARE
    current_week_start DATE;
    week_counter INTEGER := 0;
    total_weeks INTEGER;
BEGIN
    total_weeks := CEIL(p_duration_days::NUMERIC / 6); -- 6 working days per week
    current_week_start := DATE_TRUNC('week', p_start_date)::DATE;
    
    WHILE week_counter < total_weeks LOOP
        INSERT INTO weekly_payment_tracking (
            loan_application_id,
            customer_id,
            agent_id,
            branch_id,
            week_start
        ) VALUES (
            p_loan_application_id,
            p_customer_id,
            p_agent_id,
            p_branch_id,
            current_week_start
        ) ON CONFLICT (loan_application_id, week_start) DO NOTHING;
        
        current_week_start := current_week_start + INTERVAL '7 days';
        week_counter := week_counter + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
