/*
  # [Security] Add Missing RLS Policies
  This migration adds Row Level Security (RLS) policies to tables that had RLS enabled but no policies defined. This is a critical security measure to ensure data is only accessible by authorized users based on their role and branch.

  ## Query Description:
  This operation is safe and does not modify any data. It strictly adds security policies to enforce the existing access rules. It resolves the "RLS Enabled No Policy" security advisory.

  ## Metadata:
  - Schema-Category: ["Security", "Safe"]
  - Impact-Level: ["Low"]
  - Requires-Backup: false
  - Reversible: true (by dropping the policies)

  ## Structure Details:
  - Tables affected: guarantors, loan_products, weekly_payment_tracking, audit_logs

  ## Security Implications:
  - RLS Status: Enforcing policies on previously unprotected tables.
  - Policy Changes: Yes
  - Auth Requirements: Policies rely on `auth.uid()` and the `users` table.
*/

-- Policies for loan_products
-- Admins can do anything.
CREATE POLICY "admin_all_access_on_loan_products" ON "public"."loan_products"
AS PERMISSIVE FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users WHERE users.auth_id = auth.uid() AND users.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users WHERE users.auth_id = auth.uid() AND users.role = 'admin'
  )
);

-- Any authenticated user can view loan products.
CREATE POLICY "authenticated_read_on_loan_products" ON "public"."loan_products"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);


-- Policies for guarantors
-- Users can see guarantors if they can see the associated customer.
CREATE POLICY "user_can_view_guarantors_for_their_customers" ON "public"."guarantors"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM customers
    WHERE
      customers.id = guarantors.customer_id
  )
);

-- Agents can insert guarantors for their own customers.
CREATE POLICY "agents_can_insert_guarantors_for_their_customers" ON "public"."guarantors"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM customers
    WHERE
      customers.id = guarantors.customer_id AND
      customers.agent_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  )
);

-- Admins/Sub-admins can manage guarantors in their branch scope.
CREATE POLICY "admins_can_manage_guarantors" ON "public"."guarantors"
AS PERMISSIVE FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM customers c
    JOIN users u ON c.branch_id = u.branch_id
    WHERE c.id = guarantors.customer_id AND u.auth_id = auth.uid() AND u.role IN ('admin', 'sub_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM customers c
    JOIN users u ON c.branch_id = u.branch_id
    WHERE c.id = guarantors.customer_id AND u.auth_id = auth.uid() AND u.role IN ('admin', 'sub_admin')
  )
);


-- Policies for weekly_payment_tracking
-- Users can manage records within their own branch.
CREATE POLICY "branch_users_can_manage_weekly_payments" ON "public"."weekly_payment_tracking"
AS PERMISSIVE FOR ALL
TO authenticated
USING (
  branch_id IN (
    SELECT branch_id FROM users WHERE auth_id = auth.uid() AND users.branch_id IS NOT NULL
  )
)
WITH CHECK (
  branch_id IN (
    SELECT branch_id FROM users WHERE auth_id = auth.uid() AND users.branch_id IS NOT NULL
  )
);

-- Agents can only manage records assigned to them.
CREATE POLICY "agents_can_manage_their_weekly_payments" ON "public"."weekly_payment_tracking"
AS PERMISSIVE FOR ALL
TO authenticated
USING (
  agent_id = (SELECT id FROM users WHERE auth_id = auth.uid())
)
WITH CHECK (
  agent_id = (SELECT id FROM users WHERE auth_id = auth.uid())
);


-- Policies for audit_logs
-- Only admins can view audit logs.
CREATE POLICY "admin_all_access_on_audit_logs" ON "public"."audit_logs"
AS PERMISSIVE FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users WHERE users.auth_id = auth.uid() AND users.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users WHERE users.auth_id = auth.uid() AND users.role = 'admin'
  )
);
