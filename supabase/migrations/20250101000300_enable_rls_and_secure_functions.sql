/*
          # [CRITICAL SECURITY FIX] Enable RLS and Secure Functions
          This migration addresses critical security advisories by enabling Row Level Security (RLS) on all necessary tables and securing database functions by setting a fixed search_path.

          ## Query Description: 
          This operation enables the security policies that were previously created but not activated. It ensures that users can only access data they are permitted to see (e.g., an agent only sees their own customers). It is a critical, non-destructive security enhancement.

          ## Metadata:
          - Schema-Category: "Security"
          - Impact-Level: "High"
          - Requires-Backup: false
          - Reversible: true (by disabling RLS)
          
          ## Security Implications:
          - RLS Status: Enabling RLS on all data tables.
          - Policy Changes: No, activating existing policies.
          - Auth Requirements: This fix is essential for the authentication system to function securely.
          
          ## Performance Impact:
          - Indexes: None
          - Triggers: None
          - Estimated Impact: Minimal performance impact; RLS is highly optimized in PostgreSQL.
          */

-- Enable Row Level Security on all tables with policies
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guarantors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_payment_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Secure functions by setting a non-mutable search_path
CREATE OR REPLACE FUNCTION public.assign_agent_to_branch_admin()
RETURNS TRIGGER AS $$
BEGIN
    -- When an agent is created, ensure they're linked to their branch
    IF NEW.role = 'agent' AND NEW.branch_id IS NOT NULL THEN
        -- Update created_by to branch sub_admin if not set
        IF NEW.created_by IS NULL THEN
            NEW.created_by := (
                SELECT id FROM public.users 
                WHERE branch_id = NEW.branch_id 
                AND role = 'sub_admin' 
                LIMIT 1
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.create_weekly_payment_schedule(
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
        INSERT INTO public.weekly_payment_tracking (
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
