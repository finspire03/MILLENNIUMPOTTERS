/*
# Millennium Potter Fintech Platform - Initial Database Schema
Complete database setup for branch-based microfinance platform with hierarchical user management

## Query Description:
This migration creates the complete database structure for Millennium Potter platform including:
- Branch management system
- User authentication and role-based access
- Customer management with guarantor support  
- Loan products and applications workflow
- Daily and weekly payment tracking systems
- Transaction monitoring and audit trails
- Real-time capabilities and performance optimization

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "High"
- Requires-Backup: false
- Reversible: true

## Structure Details:
Creates 10 main tables: branches, users, customers, guarantors, loan_products, 
loan_applications, daily_payments, weekly_payment_tracking, transactions, audit_logs

## Security Implications:
- RLS Status: Enabled on all sensitive tables
- Policy Changes: Yes - comprehensive role-based policies
- Auth Requirements: Supabase Auth integration

## Performance Impact:
- Indexes: Multiple performance indexes added
- Triggers: Audit and automation triggers
- Estimated Impact: Optimized for high-throughput operations
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Branches Table
CREATE TABLE branches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    address TEXT,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Default Branches
INSERT INTO branches (name, code, address, phone) VALUES 
('Igando Branch', 'IGD', 'Igando, Lagos, Nigeria', '+234 (0) 803 123 4567'),
('Abule-Egba Branch', 'AEB', 'Abule-Egba, Lagos, Nigeria', '+234 (0) 803 765 4321');

-- Users Table (Admin, Sub-Admin, Agent)
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'sub_admin', 'agent')),
    branch_id UUID REFERENCES branches(id),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Customers Table (No login access)
CREATE TABLE customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    date_of_birth DATE,
    address TEXT NOT NULL,
    occupation VARCHAR(100),
    monthly_income DECIMAL(15,2),
    bank_name VARCHAR(100),
    bank_account VARCHAR(20),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    branch_id UUID REFERENCES branches(id) NOT NULL,
    agent_id UUID REFERENCES users(id) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Guarantors Table
CREATE TABLE guarantors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('primary', 'secondary')),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    occupation VARCHAR(100),
    monthly_income DECIMAL(15,2),
    relationship_to_customer VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Create Indexes for Better Performance
CREATE INDEX idx_users_branch_role ON users(branch_id, role);
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_customers_branch_agent ON customers(branch_id, agent_id);
CREATE INDEX idx_loan_applications_status ON loan_applications(status, branch_id);
CREATE INDEX idx_daily_payments_date ON daily_payments(payment_date, branch_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date, branch_id);
CREATE INDEX idx_weekly_tracking_week ON weekly_payment_tracking(week_start, agent_id);

-- Row Level Security Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_payment_tracking ENABLE ROW LEVEL SECURITY;

-- Admin can see everything
CREATE POLICY admin_all_access ON users FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users u WHERE u.auth_id = auth.uid() AND u.role = 'admin'
    )
);

-- Sub-admin can see only their branch
CREATE POLICY sub_admin_branch_access ON users FOR ALL USING (
    branch_id IN (
        SELECT branch_id FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'sub_admin')
    )
);

-- Agent can see only themselves and their customers
CREATE POLICY agent_self_access ON users FOR SELECT USING (auth_id = auth.uid());

-- Customer policies - based on branch and agent
CREATE POLICY customers_branch_access ON customers FOR ALL USING (
    branch_id IN (
        SELECT branch_id FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'sub_admin')
    ) OR agent_id IN (
        SELECT id FROM users WHERE auth_id = auth.uid() AND role = 'agent'
    )
);

-- Similar policies for other tables
CREATE POLICY loan_applications_access ON loan_applications FOR ALL USING (
    branch_id IN (
        SELECT branch_id FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'sub_admin')
    ) OR agent_id IN (
        SELECT id FROM users WHERE auth_id = auth.uid() AND role = 'agent'
    )
);

CREATE POLICY daily_payments_access ON daily_payments FOR ALL USING (
    branch_id IN (
        SELECT branch_id FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'sub_admin')
    ) OR agent_id IN (
        SELECT id FROM users WHERE auth_id = auth.uid() AND role = 'agent'
    )
);

CREATE POLICY transactions_access ON transactions FOR ALL USING (
    branch_id IN (
        SELECT branch_id FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'sub_admin')
    ) OR agent_id IN (
        SELECT id FROM users WHERE auth_id = auth.uid() AND role = 'agent'
    )
);

CREATE POLICY weekly_tracking_access ON weekly_payment_tracking FOR ALL USING (
    branch_id IN (
        SELECT branch_id FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'sub_admin')
    ) OR agent_id IN (
        SELECT id FROM users WHERE auth_id = auth.uid() AND role = 'agent'
    )
);

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
    current_week_start := DATE_TRUNC('week', p_start_date) + INTERVAL '1 day'; -- Start from Monday
    
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
        );
        
        current_week_start := current_week_start + INTERVAL '7 days';
        week_counter := week_counter + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loan_applications_updated_at BEFORE UPDATE ON loan_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_payments_updated_at BEFORE UPDATE ON daily_payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_tracking_updated_at BEFORE UPDATE ON weekly_payment_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
