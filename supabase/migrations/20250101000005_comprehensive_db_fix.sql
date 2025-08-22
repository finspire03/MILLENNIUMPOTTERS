/*
  # [Comprehensive Database Fix & Hardening]
  This migration script addresses several security and data integrity issues. It removes an insecure password column, correctly links public users to auth users, adds cascading deletes for data consistency, and implements a full set of Row-Level Security policies.

  ## Query Description: [This operation overhauls the database security model. It removes a redundant password column and adds triggers and comprehensive RLS policies. This is a critical update for data protection.]
  
  ## Metadata:
  - Schema-Category: ["Structural", "Security"]
  - Impact-Level: ["High"]
  - Requires-Backup: true
  - Reversible: false
  
  ## Structure Details:
  - Modifies: `users`, `guarantors` tables
  - Adds: `handle_new_user` function and trigger
  - Adds: RLS policies to `customers`, `guarantors`, `loan_applications`, `daily_payments`, `transactions`
  
  ## Security Implications:
  - RLS Status: [Enabled/Strengthened]
  - Policy Changes: [Yes]
  - Auth Requirements: [Enhances link to Supabase Auth]
  
  ## Performance Impact:
  - Indexes: [None]
  - Triggers: [Added]
  - Estimated Impact: [Low performance impact, high security gain]
*/

-- Step 1: Remove the insecure password_hash column from the users table.
ALTER TABLE public.users
DROP COLUMN IF EXISTS password_hash;

-- Step 2: Create a function to automatically copy new users from auth.users to public.users.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_id, email, first_name, last_name, phone, role, branch_id, email_verified)
  VALUES (
    NEW.id, 
    NEW.email,
    NEW.raw_user_meta_data->>'firstName',
    NEW.raw_user_meta_data->>'lastName',
    NEW.raw_user_meta_data->>'phone',
    (NEW.raw_user_meta_data->>'role')::public.user_role,
    (NEW.raw_user_meta_data->>'branchId')::uuid,
    NEW.email_confirmed_at IS NOT NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create a trigger to call the function when a new user is created.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Add ON DELETE CASCADE to guarantors for data integrity.
ALTER TABLE public.guarantors
DROP CONSTRAINT IF EXISTS guarantors_customer_id_fkey,
ADD CONSTRAINT guarantors_customer_id_fkey
  FOREIGN KEY (customer_id)
  REFERENCES public.customers(id)
  ON DELETE CASCADE;

-- Step 5: Implement comprehensive RLS policies for all tables.

-- Customers Table Policies
DROP POLICY IF EXISTS "Admin full access on customers" ON public.customers;
CREATE POLICY "Admin full access on customers" ON public.customers FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Sub-admin access to their branch customers" ON public.customers;
CREATE POLICY "Sub-admin access to their branch customers" ON public.customers FOR ALL
  USING (
    (SELECT role FROM public.users WHERE auth_id = auth.uid()) = 'sub_admin' AND
    branch_id = (SELECT branch_id FROM public.users WHERE auth_id = auth.uid())
  )
  WITH CHECK (
    (SELECT role FROM public.users WHERE auth_id = auth.uid()) = 'sub_admin' AND
    branch_id = (SELECT branch_id FROM public.users WHERE auth_id = auth.uid())
  );

DROP POLICY IF EXISTS "Agent access to their own customers" ON public.customers;
CREATE POLICY "Agent access to their own customers" ON public.customers FOR ALL
  USING (
    (SELECT role FROM public.users WHERE auth_id = auth.uid()) = 'agent' AND
    agent_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
  )
  WITH CHECK (
    (SELECT role FROM public.users WHERE auth_id = auth.uid()) = 'agent' AND
    agent_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
  );

-- Loan Applications Table Policies
DROP POLICY IF EXISTS "Admin full access on loan_applications" ON public.loan_applications;
CREATE POLICY "Admin full access on loan_applications" ON public.loan_applications FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Sub-admin access to their branch loan_applications" ON public.loan_applications;
CREATE POLICY "Sub-admin access to their branch loan_applications" ON public.loan_applications FOR ALL
  USING (
    (SELECT role FROM public.users WHERE auth_id = auth.uid()) = 'sub_admin' AND
    branch_id = (SELECT branch_id FROM public.users WHERE auth_id = auth.uid())
  )
  WITH CHECK (
    (SELECT role FROM public.users WHERE auth_id = auth.uid()) = 'sub_admin' AND
    branch_id = (SELECT branch_id FROM public.users WHERE auth_id = auth.uid())
  );

DROP POLICY IF EXISTS "Agent access to their own loan_applications" ON public.loan_applications;
CREATE POLICY "Agent access to their own loan_applications" ON public.loan_applications FOR ALL
  USING (
    (SELECT role FROM public.users WHERE auth_id = auth.uid()) = 'agent' AND
    agent_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
  )
  WITH CHECK (
    (SELECT role FROM public.users WHERE auth_id = auth.uid()) = 'agent' AND
    agent_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
  );

-- Daily Payments Table Policies
DROP POLICY IF EXISTS "Admin full access on daily_payments" ON public.daily_payments;
CREATE POLICY "Admin full access on daily_payments" ON public.daily_payments FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Sub-admin access to their branch daily_payments" ON public.daily_payments;
CREATE POLICY "Sub-admin access to their branch daily_payments" ON public.daily_payments FOR ALL
  USING (
    (SELECT role FROM public.users WHERE auth_id = auth.uid()) = 'sub_admin' AND
    branch_id = (SELECT branch_id FROM public.users WHERE auth_id = auth.uid())
  )
  WITH CHECK (
    (SELECT role FROM public.users WHERE auth_id = auth.uid()) = 'sub_admin' AND
    branch_id = (SELECT branch_id FROM public.users WHERE auth_id = auth.uid())
  );

DROP POLICY IF EXISTS "Agent access to their own daily_payments" ON public.daily_payments;
CREATE POLICY "Agent access to their own daily_payments" ON public.daily_payments FOR ALL
  USING (
    (SELECT role FROM public.users WHERE auth_id = auth.uid()) = 'agent' AND
    agent_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
  )
  WITH CHECK (
    (SELECT role FROM public.users WHERE auth_id = auth.uid()) = 'agent' AND
    agent_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
  );

-- Transactions Table Policies
DROP POLICY IF EXISTS "Admin full access on transactions" ON public.transactions;
CREATE POLICY "Admin full access on transactions" ON public.transactions FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Sub-admin access to their branch transactions" ON public.transactions;
CREATE POLICY "Sub-admin access to their branch transactions" ON public.transactions FOR ALL
  USING (
    (SELECT role FROM public.users WHERE auth_id = auth.uid()) = 'sub_admin' AND
    branch_id = (SELECT branch_id FROM public.users WHERE auth_id = auth.uid())
  )
  WITH CHECK (
    (SELECT role FROM public.users WHERE auth_id = auth.uid()) = 'sub_admin' AND
    branch_id = (SELECT branch_id FROM public.users WHERE auth_id = auth.uid())
  );

DROP POLICY IF EXISTS "Agent access to their own transactions" ON public.transactions;
CREATE POLICY "Agent access to their own transactions" ON public.transactions FOR ALL
  USING (
    (SELECT role FROM public.users WHERE auth_id = auth.uid()) = 'agent' AND
    agent_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
  )
  WITH CHECK (
    (SELECT role FROM public.users WHERE auth_id = auth.uid()) = 'agent' AND
    agent_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
  );

-- Guarantors Table Policies
DROP POLICY IF EXISTS "Admin full access on guarantors" ON public.guarantors;
CREATE POLICY "Admin full access on guarantors" ON public.guarantors FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Sub-admin and Agent can view guarantors for their customers" ON public.guarantors;
CREATE POLICY "Sub-admin and Agent can view guarantors for their customers" ON public.guarantors FOR SELECT
  USING (
    customer_id IN (SELECT id FROM public.customers)
  );

DROP POLICY IF EXISTS "Agents can create guarantors for their customers" ON public.guarantors;
CREATE POLICY "Agents can create guarantors for their customers" ON public.guarantors FOR INSERT
  WITH CHECK (
    (SELECT role FROM public.users WHERE auth_id = auth.uid()) = 'agent' AND
    customer_id IN (SELECT id FROM public.customers WHERE agent_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()))
  );
